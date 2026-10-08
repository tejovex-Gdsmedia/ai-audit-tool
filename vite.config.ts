import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load vars from .env files (local dev). loadEnv prefix '' = load everything.
  const env = loadEnv(mode, process.cwd(), '')

  // For each VITE_ var: prefer .env file value, fall back to process.env (Netlify CI injects vars here).
  // This bridges the gap between Netlify's dashboard env vars and Vite's import.meta.env.
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Statically replace import.meta.env.VITE_* in the bundle at build time
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})

