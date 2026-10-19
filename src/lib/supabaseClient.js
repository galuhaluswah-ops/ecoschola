import { createClient } from '@supabase/supabase-js';

const normalizeSupabaseUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  // Automatically convert dashboard project URL if user accidentally copied from browser address bar
  const match = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  return trimmed;
};

// Fallback credentials ensure seamless cloud connectivity on Netlify / static production deployments
const DEFAULT_SUPABASE_URL = 'https://rwkjarkzlrzqhblfxpel.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3a2phcmt6bHJ6cWhibGZ4cGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjU2NjgsImV4cCI6MjEwNzkwMTY2OH0.EZQzRy9sgovfKw96sWsYvIaKgpU1Lg4lhgtCL3n31FI';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

// Check if credentials are valid and not default placeholders
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey !== 'your-anon-public-key'
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Pings Supabase to check if the cloud database is reachable
 * Returns true if reachable, false if offline or error
 */
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }
  try {
    const { error } = await supabase.from('classes').select('id').limit(1);
    return !error;
  } catch (e) {
    console.warn('[Supabase] Offline fallback triggered:', e.message);
    return false;
  }
};
