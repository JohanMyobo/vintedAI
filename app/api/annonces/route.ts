import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'
import { put } from '@vercel/blob'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const data = await sql`
    SELECT * FROM annonces WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: {
    generated_listing_id?: string
    titre: string
    description: string
    marque: string
    categorie: string
    taille: string
    etat: string
    couleur: string
    prix_suggere: number
    photo_base64?: string | null
  }

  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Corps invalide' }, { status: 400 }) }

  let photo_url: string | null = null

  if (body.photo_base64 && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const buffer = Buffer.from(body.photo_base64, 'base64')
      const filename = `${userId}/${Date.now()}.jpg`
      const { url } = await put(filename, buffer, { access: 'public', contentType: 'image/jpeg' })
      photo_url = url
    } catch (e) {
      console.error('Blob upload error:', e)
    }
  }

  const rows = await sql`
    INSERT INTO annonces (user_id, generated_listing_id, titre, description, marque, categorie, taille, etat, couleur, prix_suggere, photo_url)
    VALUES (
      ${userId},
      ${body.generated_listing_id ?? null},
      ${body.titre}, ${body.description}, ${body.marque}, ${body.categorie},
      ${body.taille}, ${body.etat}, ${body.couleur}, ${body.prix_suggere}, ${photo_url}
    )
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
