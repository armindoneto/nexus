import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to sanitize the Supabase URL and prevent "Invalid path specified in request URL" errors
function sanitizeSupabaseUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  
  // Remove trailing slashes
  while (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }

  // If the user pasted something containing subpaths like /rest/v1, /auth/v1, etc., extract the origin
  try {
    const parsed = new URL(clean);
    return parsed.origin;
  } catch (e) {
    return clean;
  }
}

// Access variables from import.meta.env for Vite projects
// @ts-ignore
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
// @ts-ignore
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client (possibly invalid URL format):", err);
      return null;
    }
  }
  return supabaseClient;
}
