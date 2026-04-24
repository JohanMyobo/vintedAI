'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = getSupabaseBrowser()
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSent(true)
    setLoading(false)
  }

  const handleLogout = async () => {
    await getSupabaseBrowser().auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/saved"
          className="text-sm text-[#1D9E75] font-medium hover:underline"
        >
          Mes annonces
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Déconnexion
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm px-3 py-1.5 rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white transition-colors"
      >
        Connexion
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="font-bold text-gray-800 text-lg">Vérifie ta boîte mail</h3>
                <p className="text-gray-500 text-sm mt-2">
                  On t&apos;a envoyé un lien de connexion à <strong>{email}</strong>
                </p>
                <button
                  onClick={() => { setShowModal(false); setSent(false); setEmail('') }}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Connexion</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Entre ton email — on t&apos;envoie un lien magique, sans mot de passe.
                </p>
                <form onSubmit={handleLogin} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-[#1D9E75] text-white font-semibold hover:bg-[#178a64] disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
