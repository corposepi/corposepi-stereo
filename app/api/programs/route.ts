import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/auth'

// GET /api/programs — público, devuelve todos los programas activos
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .order('order_num', { ascending: true })

    if (error) return NextResponse.json([], { status: 200 })
    return NextResponse.json(data ?? [])
  } catch {
    // Supabase no configurado — devuelve array vacío para no romper la UI
    return NextResponse.json([], { status: 200 })
  }
}

// POST /api/programs — protegido, crea un programa
export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const body = await req.json()
  const { title, host, description, start_time, end_time, days, is_active, order_num } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('programs')
    .insert([{ title, host: host || '', description: description || '', start_time, end_time, days: days || 'all', is_active: is_active ?? true, order_num: order_num ?? 0 }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
