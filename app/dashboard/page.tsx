'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import DashboardStats from '@/components/dashboard/DashboardStats'
import AnnonceCard, { Annonce } from '@/components/dashboard/AnnonceCard'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

const FILTRES = ['Toutes', 'Actives', 'Réservées', 'Vendues', 'Archivées'] as const
const FILTRE_MAP: Record<string, string> = {
  Actives: 'active', Réservées: 'reservee', Vendues: 'vendue', Archivées: 'archivee',
}

export default function DashboardPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<typeof FILTRES[number]>('Toutes')

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return }
      setLoggedIn(true)
      setToken(session.access_token)
      await fetchAnnonces(session.access_token)
    })
  }, [])

  const fetchAnnonces = async (t: string) => {
    const res = await fetch('/api/annonces', {
      headers: { Authorization: `Bearer ${t}` },
    })
    if (res.ok) setAnnonces(await res.json())
    setLoading(false)
  }

  const handleUpdate = useCallback(async (id: string, updates: Partial<Annonce>) => {
    if (!token) return
    const res = await fetch(`/api/annonces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setAnnonces(prev => prev.map(a => a.id === id ? updated : a))
    }
  }, [token])

  const handleDelete = useCallback(async (id: string) => {
    if (!token || !confirm('Supprimer cette annonce du dashboard ?')) return
    const res = await fetch(`/api/annonces/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setAnnonces(prev => prev.filter(a => a.id !== id))
  }, [token])

  const filtered = filtre === 'Toutes'
    ? annonces
    : annonces.filter(a => a.statut === FILTRE_MAP[filtre])

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1D9E75]/5 to-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center text-white text-lg font-bold shadow">
              V
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">VintedAI</p>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </Link>
          <AuthButton />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        )}

        {!loading && !loggedIn && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="font-semibold text-gray-700">Connecte-toi pour accéder au dashboard</p>
            <Link href="/" className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm hover:bg-[#178a64] transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        )}

        {!loading && loggedIn && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Mes annonces</h2>
              <Link
                href="/"
                className="px-4 py-2 text-sm rounded-lg bg-[#1D9E75] text-white font-semibold hover:bg-[#178a64] transition-colors"
              >
                + Générer
              </Link>
            </div>

            <DashboardStats annonces={annonces} />

            {/* Filtres */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {FILTRES.map(f => (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filtre === f
                      ? 'bg-[#1D9E75] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1D9E75]'
                  }`}
                >
                  {f}
                  {f !== 'Toutes' && (
                    <span className="ml-1 text-xs opacity-70">
                      {annonces.filter(a => a.statut === FILTRE_MAP[f]).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold text-gray-700">Aucune annonce {filtre !== 'Toutes' ? filtre.toLowerCase() : ''}</p>
                {filtre === 'Toutes' && (
                  <p className="text-sm text-gray-400 mt-1">Génère une annonce et ajoute-la au dashboard</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(annonce => (
                  <AnnonceCard
                    key={annonce.id}
                    annonce={annonce}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
