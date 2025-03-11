
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

serve(async (req: Request) => {
  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active streams
    const { data: streams, error: streamsError } = await supabaseClient
      .from('streams')
      .select('*')
      .eq('isActive', true);

    if (streamsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch streams' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate M3U content
    let content = '#EXTM3U\n';
    
    const baseProxyUrl = Deno.env.get('PUBLIC_STREAMLINK_PROXY_URL') || 'http://localhost:3001/api/proxy/streamlink';

    for (const stream of streams) {
      // Parse streamlink options if present
      const streamlinkOptions: StreamlinkOptions = stream.streamlink_options 
        ? JSON.parse(stream.streamlink_options) 
        : {};

      let streamUrl = stream.url;
      
      // If using streamlink with proxy, generate secure token
      if (stream.useStreamlink && streamlinkOptions.useProxy && streamlinkOptions.secureTokenEnabled) {
        const token = randomUUID();
        
        // Set expiry time (24 hours from now for M3U playlists)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Save the session to the database
        await supabaseClient
          .from('streamlink_sessions')
          .insert({
            stream_id: stream.id,
            token,
            expires_at: expiresAt.toISOString(),
          });
        
        streamUrl = `${baseProxyUrl}/${stream.id}?token=${token}`;
        
        // Add referrer for proxy streams
        content += `#EXTVLCOPT:http-referrer=${stream.url}\n`;
        content += `#EXTVLCOPT:network-caching=1000\n`;
      }
      
      content += `#EXTINF:-1 tvg-id="${stream.id}" tvg-name="${stream.name}" tvg-logo="${stream.logo || ''}" group-title="${stream.category}",${stream.name}\n`;
      content += `${streamUrl}\n`;
    }

    return new Response(
      JSON.stringify({ 
        content,
        filename: `iptv-playlist-${new Date().toISOString().split('T')[0]}.m3u`
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
