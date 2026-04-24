import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.id ?? null
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const userId = await getUserId(req)

  let body: { id: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const { id } = body
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }

  // Match by user_id if logged in, otherwise by IP
  const query = supabaseAdmin
    .from('listings')
    .update({ saved: true })
    .eq('id', id)

  const { error } = userId
    ? await query.eq('user_id', userId)
    : await query.eq('ip', ip)

  if (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
