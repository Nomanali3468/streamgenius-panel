
import { createClient } from '@supabase/supabase-js';
import type { Stream, SupabaseStream, StreamlinkProxyResponse, StreamlinkSession } from './types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Convert database stream to application stream
export const toAppStream = (dbStream: SupabaseStream): Stream => {
  return {
    ...dbStream,
    streamlinkOptions: dbStream.streamlink_options ? JSON.parse(dbStream.streamlink_options) : undefined,
  };
};

// Convert application stream to database stream
export const toDbStream = (appStream: Partial<Stream>): Partial<SupabaseStream> => {
  const { streamlinkOptions, ...rest } = appStream;
  return {
    ...rest,
    streamlink_options: streamlinkOptions ? JSON.stringify(streamlinkOptions) : null,
  };
};

// Get all streams from Supabase
export const fetchStreams = async (): Promise<Stream[]> => {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(toAppStream);
};

// Get a stream by ID
export const fetchStream = async (id: string): Promise<Stream> => {
  const { data, error } = await supabase
    .from('streams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  
  return toAppStream(data);
};

// Create a new stream
export const createSupabaseStream = async (stream: Omit<Stream, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stream> => {
  const dbStream = toDbStream(stream);
  
  const { data, error } = await supabase
    .from('streams')
    .insert(dbStream)
    .select()
    .single();

  if (error) throw error;
  
  return toAppStream(data);
};

// Update a stream
export const updateSupabaseStream = async (id: string, stream: Partial<Stream>): Promise<Stream> => {
  const dbStream = toDbStream(stream);
  
  const { data, error } = await supabase
    .from('streams')
    .update(dbStream)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return toAppStream(data);
};

// Delete a stream
export const deleteSupabaseStream = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('streams')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Create a new streamlink proxy session
export const createStreamlinkProxy = async (streamId: string): Promise<StreamlinkProxyResponse> => {
  // Call the Supabase Edge Function to create a proxy
  const { data, error } = await supabase.functions.invoke('create-streamlink-proxy', {
    body: { streamId }
  });

  if (error) throw error;
  
  return data as StreamlinkProxyResponse;
};

// Get a streamlink session by token
export const getStreamlinkSession = async (token: string): Promise<StreamlinkSession> => {
  const { data, error } = await supabase
    .from('streamlink_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (error) throw error;
  
  return data;
};

// Generate M3U playlist
export const generateSupabaseM3U = async (): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-m3u', {
    body: {}
  });

  if (error) throw error;
  
  return data.content;
};
