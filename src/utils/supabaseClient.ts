import { createClient } from '@supabase/supabase-js';

// Values are statically injected at build time by vite.config.ts define.
// Locally: read from .env file. On Netlify CI: read from process.env (dashboard vars).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
