import { createClient } from '@supabase/supabase-js'

// Server-side (service role — lectura/escritura completa, sólo en API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
