import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyToken } from '@/lib/auth'

async function authenticate(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return false
  try { await verifyToken(token); return true } catch { return false }
}

// PUT /api/programs/[id] — actualizar programa
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await authenticate(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { title, host, description, start_time, end_time, days, is_active, order_num } = body

  const { data, error } = await supabaseAdmin
    .from('programs')
    .update({
      title, host: host || '', description: description || '',
      start_time, end_time, days: days || 'all',
      is_active: is_active ?? true, order_num: order_num ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/programs/[id] — eliminar programa
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await authenticate(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('programs')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
