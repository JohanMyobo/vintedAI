'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { formatForClipboard, Listing } from '@/lib/formatListing'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

export default function SavedPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setLoading(false); return }

    fetch('/api/listings/saved')
      .then(r => r.json())
      .then(data => { setListings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isSignedIn, isLoaded])

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
            <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center text-white text-lg font-bold shadow">V</div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">VintedAI</p>
              <p className="text-xs text-gray-500">Annonces sauvegardées</p>
            </div>
          </Link>
          <AuthButton />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Mes annonces sauvegardées</h2>

        {(!isLoaded || loading) && <div className="text-center py-16 text-gray-400">Chargement...</div>}

        {isLoaded && !isSignedIn && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-semibold text-gray-700">Connecte-toi pour voir tes annonces</p>
            <Link href="/" className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm hover:bg-[#178a64] transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        )}

        {isLoaded && isSignedIn && !loading && listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-gray-700">Aucune annonce sauvegardée</p>
            <Link href="/" className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm hover:bg-[#178a64] transition-colors">
              Générer une annonce
            </Link>
          </div>
        )}

        {isLoaded && isSignedIn && !loading && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-800">{listing.titre}</h3>
                  <span className="text-lg font-bold text-[#1D9E75] whitespace-nowrap">{listing.prix_suggere}€</span>
                </div>
                <p className="text-sm text-gray-500 whitespace-pre-line mb-4 line-clamp-3">{listing.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                  {[listing.marque, listing.categorie, listing.taille, listing.etat].map((v, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded-full">{v}</span>
                  ))}
                </div>
                <button
                  onClick={() => handleCopy(listing)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${copiedId === listing.id ? 'bg-green-500' : 'bg-[#1D9E75] hover:bg-[#178a64]'}`}
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
