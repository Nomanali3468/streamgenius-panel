
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { spawn } = require('child_process');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db('stream-genius');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

// Connect to MongoDB on startup
connectToMongo();

// Streamlink proxy route with token authentication
app.get('/api/proxy/streamlink/:streamId', async (req, res) => {
  try {
    const { streamId } = req.params;
    const { token } = req.query;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Validate token
    const sessionCollection = db.collection('streamlink_sessions');
    const streamCollection = db.collection('streams');
    
    const session = await sessionCollection.findOne({ 
      stream_id: streamId,
      token: token
    });
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Get the stream
    const stream = await streamCollection.findOne({ _id: new ObjectId(streamId) });
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Parse streamlink options
    const streamlinkOptions = stream.streamlinkOptions || {};
    
    // Build Streamlink command
    const args = [
      stream.url,
      streamlinkOptions.quality || 'best',
      '--player-external-http',
      '--player-external-http-port=0', // Use a random available port
    ];
    
    // Add user agent if specified
    if (streamlinkOptions.useUserAgent && streamlinkOptions.userAgent) {
      args.push('--http-header');
      args.push(`User-Agent=${streamlinkOptions.userAgent}`);
    }
    
    // Add custom args if specified
    if (streamlinkOptions.customArgs) {
      const customArgs = streamlinkOptions.customArgs.split(' ');
      args.push(...customArgs);
    }
    
    console.log('Starting Streamlink with args:', args);
    
    // Start Streamlink process
    const streamlink = spawn('streamlink', args);
    
    // Get the HTTP server port that Streamlink is using
    let streamlinkPort;
    streamlink.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('Streamlink stderr:', output);
      
      // Extract the port number from Streamlink output
      const match = output.match(/Player server started on port (\d+)/);
      if (match && match[1]) {
        streamlinkPort = parseInt(match[1], 10);
        console.log(`Streamlink server running on port ${streamlinkPort}`);
      }
    });
    
    streamlink.stdout.on('data', (data) => {
      console.log('Streamlink stdout:', data.toString());
    });
    
    // Wait for Streamlink to start its HTTP server
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (streamlinkPort) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
    
    // Proxy the video stream
    const proxyReq = http.request(
      {
        host: '127.0.0.1',
        port: streamlinkPort,
        path: '/',
        method: 'GET',
      },
      (proxyRes) => {
        // Set appropriate headers
        res.writeHead(proxyRes.statusCode, {
          ...proxyRes.headers,
          'Content-Type': 'video/mp4', // Force content type for better compatibility
        });
        
        // Pipe Streamlink's output to our response
        proxyRes.pipe(res);
        
        // Clean up when client disconnects
        res.on('close', () => {
          streamlink.kill();
          console.log('Client disconnected, killed Streamlink process');
        });
      }
    );
    
    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.status(500).json({ error: 'Failed to proxy stream' });
      streamlink.kill();
    });
    
    proxyReq.end();
    
  } catch (error) {
    console.error('Streamlink proxy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create proxy tokens
app.post('/api/proxy/token', async (req, res) => {
  try {
    const { streamId } = req.body;
    
    if (!streamId) {
      return res.status(400).json({ error: 'Stream ID is required' });
    }
    
    // Get the stream
    const streamCollection = db.collection('streams');
    const stream = await streamCollection.findOne({ _id: new ObjectId(streamId) });
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Generate a token
    const token = require('crypto').randomUUID();
    
    // Set expiry time (4 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    
    // Save the session
    const sessionCollection = db.collection('streamlink_sessions');
    await sessionCollection.insertOne({
      stream_id: streamId,
      token,
      expires_at: expiresAt,
      created_at: new Date()
    });
    
    // Generate the proxy URL
    const baseUrl = process.env.STREAMLINK_PROXY_URL || 'http://localhost:3000/api/proxy/streamlink';
    const proxyUrl = `${baseUrl}/${streamId}?token=${token}`;
    
    res.json({
      proxyUrl,
      token,
      expiresAt,
    });
    
  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate M3U playlist
app.get('/api/generate-m3u', async (req, res) => {
  try {
    // Get all active streams
    const streamCollection = db.collection('streams');
    const streams = await streamCollection.find({ isActive: true }).toArray();
    
    let content = '#EXTM3U\n';
    
    const baseProxyUrl = process.env.STREAMLINK_PROXY_URL || 'http://localhost:3000/api/proxy/streamlink';
    
    for (const stream of streams) {
      // If using streamlink with proxy, generate secure token
      if (stream.useStreamlink && stream.streamlinkOptions?.useProxy && stream.streamlinkOptions?.secureTokenEnabled) {
        const token = require('crypto').randomUUID();
        
        // Set expiry time (24 hours from now for M3U playlists)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Save the session to the database
        const sessionCollection = db.collection('streamlink_sessions');
        await sessionCollection.insertOne({
          stream_id: stream._id.toString(),
          token,
          expires_at: expiresAt,
          created_at: new Date()
        });
        
        const streamUrl = `${baseProxyUrl}/${stream._id.toString()}?token=${token}`;
        
        // Add referrer for proxy streams
        content += `#EXTVLCOPT:http-referrer=${stream.url}\n`;
        content += `#EXTVLCOPT:network-caching=1000\n`;
        content += `#EXTINF:-1 tvg-id="${stream._id.toString()}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
        content += `${streamUrl}\n`;
      } else {
        // Direct URL for non-proxy streams
        content += `#EXTINF:-1 tvg-id="${stream._id.toString()}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
        content += `${stream.url}\n`;
      }
    }
    
    res.json({
      content,
      filename: `iptv-playlist-${new Date().toISOString().split('T')[0]}.m3u`
    });
    
  } catch (error) {
    console.error('Generate M3U error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Streamlink proxy server running on port ${PORT}`);
});
