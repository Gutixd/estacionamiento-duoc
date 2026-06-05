// Conexión a Supabase
// Usar en Next.js con: import { supabase } from '@/lib/supabase'

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en .env.local')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Ejemplo de uso:
// const { data, error } = await supabase
//   .from('conductores')
//   .select('*')
