import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { userId } = await auth()

  let body: { id: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }) }

  const { id } = body
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  try {
    if (userId) {
      await sql`UPDATE listings SET saved = true WHERE id = ${id} AND user_id = ${userId}`
    } else {
      await sql`UPDATE listings SET saved = true WHERE id = ${id} AND ip = ${ip}`
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Save error:', err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}
