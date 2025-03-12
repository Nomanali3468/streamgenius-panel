
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a Streamlink proxy token and returns the proxy URL.
 * 
 * @param {string} streamId The stream ID
 * @param {Object} options Additional options
 * @returns {Promise<string>} The proxy URL
 */
export async function createStreamlinkProxy(streamId, options = {}) {
  try {
    const { data, error } = await supabase.functions.invoke("create-streamlink-proxy", {
      body: { streamId, ...options }
    });
    
    if (error) throw error;
    return data.proxyUrl;
  } catch (error) {
    console.error("Error creating Streamlink proxy:", error);
    throw error;
  }
}

/**
 * Generates a full M3U playlist.
 * 
 * @param {Object} options Options for M3U generation
 * @returns {Promise<string>} The M3U playlist content
 */
export async function generateM3U(options = {}) {
  try {
    const { data, error } = await supabase.functions.invoke("generate-m3u", {
      body: options
    });
    
    if (error) throw error;
    return data.content;
  } catch (error) {
    console.error("Error generating M3U:", error);
    throw error;
  }
}
