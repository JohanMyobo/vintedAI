import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

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

  // Only allow saving listings that belong to this IP
  const { error } = await supabaseAdmin
    .from('listings')
    .update({ saved: true })
    .eq('id', id)
    .eq('ip', ip)

  if (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
