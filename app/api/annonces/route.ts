import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.id ?? null
}

// GET — liste des annonces du dashboard
export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('annonces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  return NextResponse.json(data)
}

// POST — ajoute une annonce au dashboard
export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  let body: {
    generated_listing_id: string
    titre: string
    description: string
    marque: string
    categorie: string
    taille: string
    etat: string
    couleur: string
    prix_suggere: number
    photo_base64?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  let photo_url: string | null = null

  // Upload photo si fournie
  if (body.photo_base64) {
    try {
      const buffer = Buffer.from(body.photo_base64, 'base64')
      const filename = `${userId}/${Date.now()}.jpg`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('annonces-photos')
        .upload(filename, buffer, { contentType: 'image/jpeg', upsert: false })

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from('annonces-photos')
          .getPublicUrl(filename)
        photo_url = urlData.publicUrl
      }
    } catch (e) {
      console.error('Photo upload error:', e)
    }
  }

  const { data, error } = await supabaseAdmin
    .from('annonces')
    .insert({
      user_id: userId,
      generated_listing_id: body.generated_listing_id || null,
      titre: body.titre,
      description: body.description,
      marque: body.marque,
      categorie: body.categorie,
      taille: body.taille,
      etat: body.etat,
      couleur: body.couleur,
      prix_suggere: body.prix_suggere,
      photo_url,
    })
    .select()
    .single()

  if (error) {
    console.error('Insert annonce error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'ajout' }, { status: 500 })
  }

  return NextResponse.json(data)
}
