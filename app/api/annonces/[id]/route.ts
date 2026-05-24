import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { statut?: string; prix_vente?: number; titre?: string; description?: string; prix_suggere?: number; vinted_url?: string }
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }) }

  const soldAt = body.statut === 'vendue' ? new Date().toISOString() : null

  const rows = await sql`
    UPDATE annonces SET
      statut = COALESCE(${body.statut ?? null}, statut),
      prix_vente = COALESCE(${body.prix_vente ?? null}, prix_vente),
      titre = COALESCE(${body.titre ?? null}, titre),
      description = COALESCE(${body.description ?? null}, description),
      prix_suggere = COALESCE(${body.prix_suggere ?? null}, prix_suggere),
      vinted_url = COALESCE(${body.vinted_url ?? null}, vinted_url),
      sold_at = CASE WHEN ${body.statut ?? null} = 'vendue' THEN ${soldAt}
                     WHEN ${body.statut ?? null} IS NOT NULL THEN NULL
                     ELSE sold_at END
    WHERE id = ${params.id} AND user_id = ${userId}
    RETURNING *
  `
  if (!rows[0]) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  await sql`DELETE FROM annonces WHERE id = ${params.id} AND user_id = ${userId}`
  return NextResponse.json({ ok: true })
}
