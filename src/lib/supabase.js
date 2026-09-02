import { createClient } from '@supabase/supabase-js'

// Эти значения берутся из файла .env (см. .env.example)
// В Supabase: Project Settings → API → Project URL / anon public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Не заданы переменные окружения VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Скопируйте .env.example в .env и заполните значениями из панели Supabase.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
