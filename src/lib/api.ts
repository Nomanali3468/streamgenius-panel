import { getToken } from './auth';
import { 
  Stream, 
  AuthResponse, 
  M3UPlaylist, 
  StreamerType, 
  StreamlinkOptions, 
  StreamlinkProxyResponse 
} from './types';
import { getDb, normalizeId } from './mongodb';
import { ObjectId } from 'mongodb';

// Streamlink proxy URL from environment
const STREAMLINK_PROXY_URL = import.meta.env.VITE_STREAMLINK_PROXY_URL || 'http://localhost:3001/api/proxy/streamlink';

// Helper function to simulate API request for mock data fallback
const simulateRequest = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Headers for authenticated requests
const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generate a streamlink URL for a stream
const getStreamlinkUrl = async (stream: Stream): Promise<string> => {
  // Check if stream uses secure proxy
  if (stream.streamlinkOptions?.useProxy && stream.streamlinkOptions?.secureTokenEnabled) {
    try {
      // Get a secure proxy URL with token
      const proxyResponse = await createStreamlinkProxy(stream.id);
      return proxyResponse.proxyUrl;
    } catch (error) {
      console.error("Error creating streamlink proxy:", error);
      return stream.url; // Fallback to original URL
    }
  }
  
  // If not using streamlink, use the original URL
  if (!stream.useStreamlink) {
    return stream.url;
  }
  
  // This is for backward compatibility or non-secure proxy
  const params = new URLSearchParams({
    url: stream.url,
    type: stream.streamerType || 'other',
    quality: stream.streamlinkOptions?.quality || 'best',
  });
  
  // Add custom arguments if provided
  if (stream.streamlinkOptions?.customArgs) {
    params.append('args', stream.streamlinkOptions.customArgs);
  }
  
  // Add user agent if enabled
  if (stream.streamlinkOptions?.useUserAgent && stream.streamlinkOptions?.userAgent) {
    params.append('userAgent', stream.streamlinkOptions.userAgent);
  }
  
  return `${STREAMLINK_PROXY_URL}?${params.toString()}`;
};

// Mock API functions - these will use MongoDB when available

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  // In a real app, this would be an actual API call to MongoDB
  if (username === 'admin' && password === 'admin') {
    return simulateRequest({
      user: {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      },
      token: 'mock-admin-token',
    });
  } else if (username === 'user' && password === 'user') {
    return simulateRequest({
      user: {
        id: '2',
        username: 'user',
        email: 'user@example.com',
        role: 'user',
      },
      token: 'mock-user-token',
    });
  }
  
  // Simulate login error
  return Promise.reject(new Error('Invalid credentials'));
};

export const getStreams = async (): Promise<Stream[]> => {
  try {
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    const streams = await streamsCollection.find({}).toArray();
    
    return streams.map(stream => {
      const normalized = normalizeId(stream);
      return {
        ...normalized,
        streamlinkOptions: normalized.streamlinkOptions ?? undefined,
        createdAt: normalized.createdAt ?? new Date().toISOString(),
        updatedAt: normalized.updatedAt ?? new Date().toISOString(),
      } as Stream;
    });
  } catch (error) {
    console.error("Error fetching streams from MongoDB:", error);
    // Fallback to mock data
    return simulateRequest(mockStreams);
  }
};

export const getStream = async (id: string): Promise<Stream> => {
  try {
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    const stream = await streamsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!stream) {
      throw new Error('Stream not found');
    }
    
    const normalized = normalizeId(stream);
    return {
      ...normalized,
      streamlinkOptions: normalized.streamlinkOptions ?? undefined,
      createdAt: normalized.createdAt ?? new Date().toISOString(),
      updatedAt: normalized.updatedAt ?? new Date().toISOString(),
    } as Stream;
  } catch (error) {
    console.error("Error fetching stream from MongoDB:", error);
    // Fallback to mock data
    const stream = mockStreams.find(s => s.id === id);
    if (!stream) {
      return Promise.reject(new Error('Stream not found'));
    }
    return simulateRequest(stream);
  }
};

export const createStream = async (stream: Omit<Stream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stream> => {
  try {
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    
    const now = new Date().toISOString();
    const newStream = {
      ...stream,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await streamsCollection.insertOne(newStream);
    
    return {
      ...newStream,
      id: result.insertedId.toString()
    } as Stream;
  } catch (error) {
    console.error("Error creating stream in MongoDB:", error);
    // Fallback to mock behavior
    const newStream: Stream = {
      ...stream,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return simulateRequest(newStream);
  }
};

export const updateStream = async (id: string, stream: Partial<Stream>): Promise<Stream> => {
  try {
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    
    // Remove id from the update object as it should not be modified
    const { id: _, ...updateData } = stream;
    
    const now = new Date().toISOString();
    const result = await streamsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: now } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Stream not found');
    }
    
    const normalized = normalizeId(result);
    return {
      ...normalized,
      streamlinkOptions: normalized.streamlinkOptions ?? undefined,
      createdAt: normalized.createdAt ?? now,
      updatedAt: now,
    } as Stream;
  } catch (error) {
    console.error("Error updating stream in MongoDB:", error);
    // Fallback to mock behavior
    const existingStream = mockStreams.find(s => s.id === id);
    if (!existingStream) {
      return Promise.reject(new Error('Stream not found'));
    }
    
    const updatedStream: Stream = {
      ...existingStream,
      ...stream,
      updatedAt: new Date().toISOString(),
    };
    
    return simulateRequest(updatedStream);
  }
};

export const deleteStream = async (id: string): Promise<void> => {
  try {
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    const result = await streamsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      throw new Error('Stream not found');
    }
  } catch (error) {
    console.error("Error deleting stream from MongoDB:", error);
    // Fallback to mock behavior
    return simulateRequest(undefined);
  }
};

export const generateM3U = async (): Promise<M3UPlaylist> => {
  try {
    // Get all active streams
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    const streams = await streamsCollection.find({ isActive: true }).toArray();
    
    let content = '#EXTM3U\n';

    // Normalize MongoDB documents
    const normalizedStreams = streams.map(stream => {
      const normalized = normalizeId(stream);
      return {
        ...normalized,
        streamlinkOptions: normalized.streamlinkOptions ?? undefined,
      } as Stream;
    });
    
    // Generate entries for each stream
    for (const stream of normalizedStreams) {
      if (!stream.isActive) continue;
      
      // Get the appropriate URL (streamlink or direct)
      const streamUrl = stream.useStreamlink 
        ? await getStreamlinkUrl(stream) 
        : stream.url;
      
      // Add comment line for Streamlink-proxy streams to help with debugging
      if (stream.useStreamlink && stream.streamlinkOptions?.useProxy) {
        content += `#EXTVLCOPT:http-referrer=${stream.url}\n`;
        content += `#EXTVLCOPT:network-caching=1000\n`;
      }
      
      content += `#EXTINF:-1 tvg-id="${stream.id}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
      content += `${streamUrl}\n`;
    }
    
    return {
      content,
      filename: `iptv-playlist-${new Date().toISOString().split('T')[0]}.m3u`
    };
  } catch (error) {
    console.error("Error generating M3U:", error);
    
    // Fallback to client-side generation with mock data
    let content = '#EXTM3U\n';
    
    const streams = await getStreams();
    
    for (const stream of streams) {
      if (!stream.isActive) continue;
      
      // Get the appropriate URL (streamlink or direct)
      const streamUrl = stream.useStreamlink 
        ? await getStreamlinkUrl(stream) 
        : stream.url;
      
      // Add comment line for Streamlink-proxy streams to help with debugging
      if (stream.useStreamlink && stream.streamlinkOptions?.useProxy) {
        content += `#EXTVLCOPT:http-referrer=${stream.url}\n`;
        content += `#EXTVLCOPT:network-caching=1000\n`;
      }
      
      content += `#EXTINF:-1 tvg-id="${stream.id}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
      content += `${streamUrl}\n`;
    }
    
    return {
      content,
      filename: `iptv-playlist-${new Date().toISOString().split('T')[0]}.m3u`
    };
  }
};

// Create a streamlink proxy token for a stream
export const createStreamlinkProxy = async (streamId: string): Promise<StreamlinkProxyResponse> => {
  try {
    const db = await getDb();
    const streamsCollection = db.collection('streams');
    const sessionsCollection = db.collection('streamlink_sessions');
    
    // Get the stream
    const stream = await streamsCollection.findOne({ _id: new ObjectId(streamId) });
    if (!stream) {
      throw new Error('Stream not found');
    }
    
    // Generate a token
    const token = crypto.randomUUID();
    
    // Set expiry time (4 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    
    // Save the session
    await sessionsCollection.insertOne({
      stream_id: streamId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    });
    
    // Generate the proxy URL
    const proxyUrl = `${STREAMLINK_PROXY_URL}/${streamId}?token=${token}`;
    
    return {
      proxyUrl,
      token,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Error creating streamlink proxy:", error);
    
    // Generate a fake token as fallback
    const token = `mock-${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    
    return {
      proxyUrl: `${STREAMLINK_PROXY_URL}/${streamId}?token=${token}`,
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }
};

// Function to check if Streamlink is supported for a specific URL
export const isStreamlinkSupported = (url: string): boolean => {
  // Check if the URL is from a supported streamer
  // This is a simplified check - in a real application, you would have 
  // more comprehensive detection logic
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return true;
  }
  
  if (url.includes('twitch.tv')) {
    return true;
  }
  
  if (url.includes('dailymotion.com')) {
    return true;
  }
  
  // Add more checks for other supported platforms
  
  return false;
};

// Function to detect streamer type based on URL
export const detectStreamerType = (url: string): StreamerType => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (url.includes('twitch.tv')) {
    return 'twitch';
  }
  
  if (url.includes('dailymotion.com')) {
    return 'dailymotion';
  }
  
  return 'direct';
};

// Mock streams for fallback when MongoDB is not available
const mockStreams: Stream[] = [
  {
    id: '1',
    name: 'Sports Channel',
    url: 'http://example.com/stream1',
    category: 'Sports',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: false,
    streamerType: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'News Network',
    url: 'http://example.com/stream2',
    category: 'News',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: false,
    streamerType: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'YouTube Live',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Entertainment',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: true,
    streamerType: 'youtube',
    streamlinkOptions: {
      quality: 'best',
      useProxy: true,
      secureTokenEnabled: true,
      customArgs: '--player-passthrough=hls'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Twitch Stream',
    url: 'https://www.twitch.tv/twitchpresents',
    category: 'Gaming',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: true,
    streamerType: 'twitch',
    streamlinkOptions: {
      quality: '720p',
      useProxy: true,
      secureTokenEnabled: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Documentary World',
    url: 'http://example.com/stream5',
    category: 'Documentaries',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: false,
    streamerType: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
