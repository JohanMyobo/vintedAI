# VintedAI

Génère des annonces Vinted parfaites à partir de photos, grâce à Claude Sonnet (Anthropic).

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase (rate limiting + historique)
- API Anthropic (claude-sonnet-4-5)

## Setup

### 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Dans l'éditeur SQL, exécute le contenu de `supabase/schema.sql`
3. Récupère tes clés dans **Settings > API**

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplis `.env.local` avec :

| Variable | Où la trouver |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role secret |

### 3. Lancer en local

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

### 4. Déploiement Vercel

```bash
npx vercel
```

Ajoute les 4 variables d'env dans le dashboard Vercel (Settings > Environment Variables).

## Fonctionnement

1. Upload jusqu'à 5 photos (JPEG/PNG/WebP)
2. Les images > 1MB sont compressées automatiquement côté client
3. L'API `/api/generate` appelle Claude Sonnet avec les photos
4. Le résultat est affiché dans un formulaire éditable
5. Copie l'annonce formatée en un clic

## Rate limiting

5 générations par heure par IP, stockées dans la table `generations` Supabase.
