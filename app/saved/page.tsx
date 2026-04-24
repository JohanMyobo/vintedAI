'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { formatForClipboard, Listing } from '@/lib/formatListing'
import Link from 'next/link'

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return }
      setLoggedIn(true)

      const res = await fetch('/api/listings/saved', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) setListings(await res.json())
      setLoading(false)
    })
  }, [])

  const handleCopy = async (listing: Listing) => {
    await navigator.clipboard.writeText(formatForClipboard(listing))
    setCopiedId(listing.id ?? null)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1D9E75]/5 to-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center text-white text-lg font-bold shadow">
              V
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">VintedAI</p>
              <p className="text-xs text-gray-500">Génère tes annonces en 1 clic</p>
            </div>
          </Link>
          <Link href="/" className="text-sm text-[#1D9E75] font-medium hover:underline">
            ← Nouvelle annonce
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Mes annonces sauvegardées</h2>

        {loading && (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        )}

        {!loading && !loggedIn && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-semibold text-gray-700">Connecte-toi pour voir tes annonces</p>
            <p className="text-sm text-gray-400 mt-1">Utilise le bouton Connexion sur la page d&apos;accueil</p>
            <Link
              href="/"
              className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm hover:bg-[#178a64] transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        )}

        {!loading && loggedIn && listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-gray-700">Aucune annonce sauvegardée</p>
            <p className="text-sm text-gray-400 mt-1">Génère une annonce et clique sur ☆ Sauvegarder</p>
            <Link
              href="/"
              className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm hover:bg-[#178a64] transition-colors"
            >
              Générer une annonce
            </Link>
          </div>
        )}

        {!loading && loggedIn && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-800">{listing.titre}</h3>
                  <span className="text-lg font-bold text-[#1D9E75] whitespace-nowrap">
                    {listing.prix_suggere}€
                  </span>
                </div>
                <p className="text-sm text-gray-500 whitespace-pre-line mb-4 line-clamp-3">
                  {listing.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{listing.marque}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{listing.categorie}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{listing.taille}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{listing.etat}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{listing.couleur}</span>
                </div>
                <button
                  onClick={() => handleCopy(listing)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                    copiedId === listing.id
                      ? 'bg-green-500'
                      : 'bg-[#1D9E75] hover:bg-[#178a64]'
                  }`}
                >
                  {copiedId === listing.id ? '✓ Copié !' : 'Copier l\'annonce'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
