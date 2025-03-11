
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
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface M3UPlaylist {
  content: string;
  filename: string;
}
