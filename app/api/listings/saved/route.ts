import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const data = await sql`
    SELECT id, titre, description, marque, categorie, taille, etat, couleur, prix_suggere, created_at
    FROM listings
    WHERE user_id = ${userId} AND saved = true
    ORDER BY created_at DESC
  `
  return NextResponse.json(data)
}
