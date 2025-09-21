import { createClient } from '@supabase/supabase-js'

// Vite exposes env vars via import.meta.env
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env not set: please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local (Vite)'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
