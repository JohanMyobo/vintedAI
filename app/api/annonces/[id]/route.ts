import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.id ?? null
}

// PATCH — met à jour le statut (et prix de vente si vendue)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: { statut?: string; prix_vente?: number; titre?: string; prix_suggere?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.statut) updates.statut = body.statut
  if (body.prix_vente !== undefined) updates.prix_vente = body.prix_vente
  if (body.titre) updates.titre = body.titre
  if (body.prix_suggere !== undefined) updates.prix_suggere = body.prix_suggere
  if (body.statut === 'vendue') updates.sold_at = new Date().toISOString()
  if (body.statut && body.statut !== 'vendue') updates.sold_at = null

  const { data, error } = await supabaseAdmin
    .from('annonces')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — supprime une annonce du dashboard
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { error } = await supabaseAdmin
    .from('annonces')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
