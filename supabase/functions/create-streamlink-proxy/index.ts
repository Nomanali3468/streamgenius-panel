
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { randomUUID } from 'https://deno.land/std@0.168.0/node/crypto.ts';

interface StreamlinkOptions {
  quality?: string;
  useProxy?: boolean;
  proxyUrl?: string;
  useUserAgent?: boolean;
  userAgent?: string;
  customArgs?: string;
  secureTokenEnabled?: boolean;
}

interface Stream {
  id: string;
  name: string;
  url: string;
  category: string;
  logo?: string;
  isActive: boolean;
  useStreamlink?: boolean;
  streamerType?: string;
  streamlink_options?: string;
  created_at: string;
  updated_at: string;
}

serve(async (req: Request) => {
  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { streamId } = await req.json();

    if (!streamId) {
      return new Response(
        JSON.stringify({ error: 'Stream ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the stream
    const { data: stream, error: streamError } = await supabaseClient
      .from('streams')
      .select('*')
      .eq('id', streamId)
      .single();

    if (streamError || !stream) {
      return new Response(
        JSON.stringify({ error: 'Stream not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse streamlink options
    const streamlinkOptions: StreamlinkOptions = stream.streamlink_options 
      ? JSON.parse(stream.streamlink_options) 
      : {};

    // Generate a secure token
    const token = randomUUID();
    
    // Set expiry time (4 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4);
    
    // Save the session to the database
    const { error: sessionError } = await supabaseClient
      .from('streamlink_sessions')
      .insert({
        stream_id: streamId,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create streamlink session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate the proxy URL
    const baseUrl = Deno.env.get('PUBLIC_STREAMLINK_PROXY_URL') || 'http://localhost:3001/api/proxy/streamlink';
    const proxyUrl = `${baseUrl}/${streamId}?token=${token}`;

    return new Response(
      JSON.stringify({
        proxyUrl,
        token,
        expiresAt: expiresAt.toISOString(),
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
