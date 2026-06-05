// ════════════════════════════════════════════════════════
// Conexión a Supabase — Proyecto: estacionamiento-duoc
// Uso en Next.js: import { supabase } from '@/lib/supabase'
// ════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en .env.local')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Ejemplos de uso ──────────────────────────────────────
//
// Leer espacios:
//   const { data } = await supabase.from('espacios').select('*').order('numero')
//
// Estadísticas en vivo:
//   const { data } = await supabase.from('v_estadisticas').select('*').single()
//
// Cambiar estado (RPC):
//   await supabase.rpc('cambiar_estado_espacio', { p_numero: 25, p_estado: 'OCUPADO' })
//
// Buscar por patente (RPC):
//   await supabase.rpc('buscar_por_patente', { p_patente: 'GHJK12' })
//
// Realtime:
//   supabase.channel('rt')
//     .on('postgres_changes', { event:'UPDATE', schema:'public', table:'espacios' }, cb)
//     .subscribe()
