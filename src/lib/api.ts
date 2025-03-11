
import { getToken } from './auth';
import { Stream, AuthResponse, M3UPlaylist } from './types';

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Movie Channel',
    url: 'http://example.com/stream3',
    category: 'Movies',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Entertainment Plus',
    url: 'http://example.com/stream4',
    category: 'Entertainment',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
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
    content += `#EXTINF:-1 tvg-id="${stream.id}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
    content += `${stream.url}\n`;
  });
  
  return simulateRequest({
    content,
    filename: `iptv-playlist-${new Date().toISOString().split('T')[0]}.m3u`
  });
};
