import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, recordGeneration } from '@/lib/ratelimit'
import { supabaseAdmin } from '@/lib/supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_IMAGES = 5
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const CATEGORIES = [
  'Hauts', 'Bas', 'Robes', 'Manteaux & Vestes',
  'Chaussures', 'Accessoires', 'Sacs', 'Sport',
  'Lingerie', 'Maillots de bain', 'Enfant', 'Autre',
]

const ETATS = [
  'Neuf avec étiquette', 'Neuf sans étiquette',
  'Très bon état', 'Bon état', 'Satisfaisant',
]

const BASE_PROMPT = `Tu es un expert en vente sur Vinted. Analyse attentivement les photos et retourne UNIQUEMENT un JSON valide (aucun texte avant ou après).

Règles importantes :
- COULEUR : observe précisément la couleur dominante visible sur la photo (ex: "bleu marine", "beige crème", "rouge bordeaux"). Ne devine pas, regarde les pixels.
- PRIX : les prix Vinted sont bas. Un article d'occasion vaut en général 20-40% du prix neuf. Exemple : un jean en bon état → 8-15€, un manteau → 15-35€, un t-shirt → 3-8€. Sois compétitif.
- DESCRIPTION : structure-la avec des emojis et des sections claires, style annonce Vinted accrocheuse.

Format de description attendu (adapte selon l'article) :
✨ [phrase d'accroche sur le style/l'occasion]
👕 [matière et coupe]
💡 [conseil de style ou occasions de porter]
📐 [infos pratiques : taille, coupe, morphologie]

Retourne ce JSON :
{
  "titre": "string (max 80 chars, accrocheur avec emoji si pertinent)",
  "description": "string (structurée avec emojis comme indiqué ci-dessus)",
  "marque": "string (cherche logos, étiquettes, inscriptions sur le tissu — sinon 'Marque inconnue')",
  "categorie": "string (parmi : Hauts | Bas | Robes | Manteaux & Vestes | Chaussures | Accessoires | Sacs | Sport | Lingerie | Maillots de bain | Enfant | Autre)",
  "taille": "string (XS/S/M/L/XL ou numérique visible sur étiquette, sinon 'Non renseignée')",
  "etat": "string (parmi : Neuf avec étiquette | Neuf sans étiquette | Très bon état | Bon état | Satisfaisant)",
  "couleur": "string (couleur précise observée sur la photo)",
  "prix_suggere": "number (entier euros, prix compétitif Vinted pour article d'occasion)"
}`

function buildPrompt(savedExamples: { titre: string; description: string; prix_suggere: number }[]): string {
  if (savedExamples.length === 0) return BASE_PROMPT

  const examples = savedExamples
    .map((e, i) => `Exemple ${i + 1} :\nTitre : ${e.titre}\nDescription : ${e.description}\nPrix : ${e.prix_suggere}€`)
    .join('\n\n')

  return `${BASE_PROMPT}

---
Cet utilisateur a sauvegardé des annonces qu'il a aimées. Inspire-toi de leur ton, style et niveau de détail :

${examples}
---`
}

async function getSavedExamples(userId: string | null, ip: string) {
  const query = supabaseAdmin
    .from('listings')
    .select('titre, description, prix_suggere')
    .eq('saved', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data } = userId
    ? await query.eq('user_id', userId)
    : await query.eq('ip', ip)

  return data ?? []
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user?.id ?? null
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const userId = await getUserId(req)

  const { allowed, retryAfterMs } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Limite de 5 générations/heure atteinte", retryAfterMs },
      { status: 429 }
    )
  }

  let body: { images: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { images } = body
  if (!Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ error: 'Au moins une image est requise' }, { status: 400 })
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images autorisées` }, { status: 400 })
  }
  for (const img of images) {
    if (typeof img !== 'string') {
      return NextResponse.json({ error: 'Format image invalide' }, { status: 400 })
    }
    if (img.length * 0.75 > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Photo trop volumineuse (max 5MB par image)' }, { status: 400 })
    }
  }

  // Fetch saved examples to personalize prompt
  const savedExamples = await getSavedExamples(userId, ip)
  const prompt = buildPrompt(savedExamples)

  const imageBlocks: Anthropic.ImageBlockParam[] = images.map((base64) => ({
    type: 'image',
    source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
  }))

  let rawText: string
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: prompt }],
        },
      ],
    })
    rawText = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 502 })
  }

  let listing: Record<string, unknown>
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    listing = JSON.parse(jsonMatch[0])
  } catch {
    console.error('JSON parse error, raw:', rawText)
    return NextResponse.json({ error: 'Génération échouée — JSON invalide' }, { status: 422 })
  }

  const result = {
    titre: String(listing.titre ?? '').slice(0, 80),
    description: String(listing.description ?? ''),
    marque: String(listing.marque ?? 'Marque inconnue'),
    categorie: CATEGORIES.includes(String(listing.categorie)) ? String(listing.categorie) : 'Autre',
    taille: String(listing.taille ?? 'Non renseignée'),
    etat: ETATS.includes(String(listing.etat)) ? String(listing.etat) : 'Bon état',
    couleur: String(listing.couleur ?? ''),
    prix_suggere: Math.max(1, Math.round(Number(listing.prix_suggere) || 10)),
  }

  const { data: inserted } = await supabaseAdmin
    .from('listings')
    .insert({ ip, user_id: userId ?? undefined, ...result })
    .select('id')
    .single()

  await recordGeneration(ip)

  return NextResponse.json({
    ...result,
    id: inserted?.id ?? null,
    personalised: savedExamples.length > 0,
  })
}
