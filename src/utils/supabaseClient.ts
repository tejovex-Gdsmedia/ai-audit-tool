import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('https://') || trimmed.startsWith('http://');
};

const supabaseUrl = isValidUrl(rawUrl)
  ? (rawUrl as string).trim()
  : 'https://placeholder.supabase.co';

const supabaseAnonKey = (rawKey && typeof rawKey === 'string' && rawKey.trim().length > 0)
  ? rawKey.trim()
  : 'placeholder-anon-key';

// Initialize Supabase client with environment variables or safe fallback
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
