
// Types for our application

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  token?: string;
}

export interface Stream {
  id: string;
  name: string;
  url: string;
  category: string;
  logo?: string;
  isActive: boolean;
  useStreamlink?: boolean;
  streamerType?: StreamerType;
  streamlinkOptions?: StreamlinkOptions;
  createdAt: string;
  updatedAt: string;
}

export type StreamerType = 'youtube' | 'twitch' | 'dailymotion' | 'direct' | 'other';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface M3UPlaylist {
  content: string;
  filename: string;
}

export interface StreamlinkOptions {
  quality?: string;
  useProxy?: boolean;
  proxyUrl?: string;
  useUserAgent?: boolean;
  userAgent?: string;
  customArgs?: string;
  secureTokenEnabled?: boolean;
}

export interface StreamlinkProxyResponse {
  proxyUrl: string;
  token: string;
  expiresAt: string;
}
