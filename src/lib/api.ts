
import { getToken } from './auth';
import { Stream, AuthResponse, M3UPlaylist, StreamerType, StreamlinkOptions, StreamlinkProxyResponse } from './types';

// In a real application, this would point to your actual API URL
const API_URL = 'https://api.example.com';

// For the demo/development purposes, we'll use mock data
// In a real application, you would replace these with actual API calls
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

// Helper function to simulate API request
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

// Generate a streamlink proxy URL with secure token
const getStreamlinkProxyUrl = (stream: Stream): string => {
  if (!stream.useStreamlink) {
    return stream.url;
  }
  
  // In a real application, this would call your backend to generate a secure proxy URL
  // For now, we'll simulate with a mock URL format
  const baseUrl = 'http://localhost:3001/api/proxy/streamlink';
  const token = btoa(`${stream.id}-${Date.now()}`); // Simple token generation for demo
  
  const params = new URLSearchParams({
    token: token,
    id: stream.id,
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Generate a streamlink URL for a stream (original implementation)
const getStreamlinkUrl = (stream: Stream): string => {
  // Check if stream uses secure proxy
  if (stream.streamlinkOptions?.useProxy && stream.streamlinkOptions?.secureTokenEnabled) {
    return getStreamlinkProxyUrl(stream);
  }
  
  // If not using secure proxy, use the original direct streamlink URL approach
  if (!stream.useStreamlink) {
    return stream.url;
  }
  
  // This is a mock URL format - in a real application, this would point to your backend
  const baseUrl = 'http://localhost:3001/api/streamlink';
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
  
  return `${baseUrl}?${params.toString()}`;
};

// Create a streamlink proxy for a specific stream
export const createStreamlinkProxy = async (streamId: string): Promise<StreamlinkProxyResponse> => {
  // In a real application, this would call your backend API
  // For mockup purposes, we'll simulate a response
  const stream = mockStreams.find(s => s.id === streamId);
  
  if (!stream) {
    return Promise.reject(new Error('Stream not found'));
  }
  
  const token = btoa(`${stream.id}-${Date.now()}`);
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 4); // Token valid for 4 hours
  
  return simulateRequest({
    proxyUrl: `http://localhost:3001/api/proxy/streamlink/${stream.id}?token=${token}`,
    token: token,
    expiresAt: expiryTime.toISOString()
  });
};

// Mock API functions 

export const login = async (username: string, password: string): Promise<AuthResponse> => {
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

export const getStreams = async (): Promise<Stream[]> => {
  // In a real app, this would be an actual API call
  return simulateRequest(mockStreams);
};

export const getStream = async (id: string): Promise<Stream> => {
  // In a real app, this would be an actual API call
  const stream = mockStreams.find(s => s.id === id);
  if (!stream) {
    return Promise.reject(new Error('Stream not found'));
  }
  return simulateRequest(stream);
};

export const createStream = async (stream: Omit<Stream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stream> => {
  // In a real app, this would be an actual API call
  const newStream: Stream = {
    ...stream,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return simulateRequest(newStream);
};

export const updateStream = async (id: string, stream: Partial<Stream>): Promise<Stream> => {
  // In a real app, this would be an actual API call
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
};

export const deleteStream = async (id: string): Promise<void> => {
  // In a real app, this would be an actual API call
  return simulateRequest(undefined);
};

export const generateM3U = async (): Promise<M3UPlaylist> => {
  // In a real app, this would be an actual API call
  // For now, we'll generate a basic M3U file based on our mock data
  
  let content = '#EXTM3U\n';
  
  mockStreams.forEach(stream => {
    // Use streamlink proxy URL if the stream uses streamlink with proxy enabled
    const streamUrl = stream.useStreamlink ? getStreamlinkUrl(stream) : stream.url;
    
    // Add comment line for Streamlink-proxy streams to help with debugging
    if (stream.useStreamlink && stream.streamlinkOptions?.useProxy) {
      content += `#EXTVLCOPT:http-referrer=${stream.url}\n`;
      content += `#EXTVLCOPT:network-caching=1000\n`;
    }
    
    content += `#EXTINF:-1 tvg-id="${stream.id}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
    content += `${streamUrl}\n`;
  });
  
  return simulateRequest({
    content,
    filename: `iptv-playlist-${new Date().toISOString().split('T')[0]}.m3u`
  });
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
