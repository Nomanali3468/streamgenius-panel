import { getToken } from './auth';

// Streamlink proxy URL from environment
const STREAMLINK_PROXY_URL = import.meta.env.VITE_STREAMLINK_PROXY_URL || 'http://localhost:3001/api/proxy/streamlink';

// Helper function to simulate API request for mock data
const simulateRequest = (data, delay = 500) => {
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
const getStreamlinkUrl = async (stream) => {
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

// API functions now use mock data directly instead of MongoDB

export const login = async (username, password) => {
  // In a real app, this would be an actual API call
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

export const getStreams = async () => {
  return simulateRequest(mockStreams);
};

export const getStream = async (id) => {
  const stream = mockStreams.find(s => s.id === id);
  if (!stream) {
    return Promise.reject(new Error('Stream not found'));
  }
  return simulateRequest(stream);
};

export const createStream = async (stream) => {
  const newStream = {
    ...stream,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockStreams.push(newStream);
  return simulateRequest(newStream);
};

export const updateStream = async (id, stream) => {
  const index = mockStreams.findIndex(s => s.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Stream not found'));
  }
  
  const updatedStream = {
    ...mockStreams[index],
    ...stream,
    updatedAt: new Date().toISOString(),
  };
  
  mockStreams[index] = updatedStream;
  return simulateRequest(updatedStream);
};

export const deleteStream = async (id) => {
  const index = mockStreams.findIndex(s => s.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Stream not found'));
  }
  
  mockStreams.splice(index, 1);
  return simulateRequest(undefined);
};

export const generateM3U = async () => {
  let content = '#EXTM3U\n';
  
  const streams = mockStreams.filter(stream => stream.isActive);
  
  for (const stream of streams) {
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
};

// Create a streamlink proxy token for a stream
export const createStreamlinkProxy = async (streamId) => {
  // Generate a fake token as mock implementation
  const token = `mock-${Date.now()}`;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 4);
  
  return {
    proxyUrl: `${STREAMLINK_PROXY_URL}/${streamId}?token=${token}`,
    token,
    expiresAt: expiresAt.toISOString(),
  };
};

// Function to check if Streamlink is supported for a specific URL
export const isStreamlinkSupported = (url) => {
  // Check if the URL is from a supported streamer
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
export const detectStreamerType = (url) => {
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

// Mock streams data
const mockStreams = [
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
  {
    id: '6',
    name: 'Movies Channel',
    url: 'http://example.com/stream6',
    category: 'Entertainment',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: false,
    streamerType: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Sports Network',
    url: 'http://example.com/stream7',
    category: 'Sports',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: false,
    streamerType: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Daily News',
    url: 'http://example.com/stream8',
    category: 'News',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    useStreamlink: false,
    streamerType: 'direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
