import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://ubetkenmviaqqpkooong.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_n4YU-hpafHNMifx_yXyjbw_LC2J1OBb'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
