import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Не заданы VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Скопируйте .env.example в .env и заполните значения.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
