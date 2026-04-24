'use client'

import { useState, useCallback } from 'react'
import PhotoUploader from '@/components/PhotoUploader'
import ListingForm from '@/components/ListingForm'
import RateLimitBanner from '@/components/RateLimitBanner'
import { Listing } from '@/lib/formatListing'

type AppState = 'upload' | 'loading' | 'result'

interface GenerateError {
  message: string
  retryAfterMs?: number
}

export default function Home() {
  const [state, setState] = useState<AppState>('upload')
  const [listing, setListing] = useState<Listing | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [error, setError] = useState<GenerateError | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const generate = useCallback(async (images: string[]) => {
    setPhotos(images)
    setError(null)
    setState('loading')

    const ac = new AbortController()
    setAbortController(ac)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
        signal: ac.signal,
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError({ message: data.error, retryAfterMs: data.retryAfterMs })
        } else if (res.status === 400 && data.error?.includes('volumineuse')) {
          setError({ message: 'Photo trop volumineuse (max 5MB par image)' })
        } else if (res.status === 422) {
          setError({ message: "Génération échouée — réessaie avec d'autres photos" })
        } else {
          setError({ message: data.error || 'Erreur inconnue' })
        }
        setState('upload')
        return
      }

      setListing(data)
      setState('result')
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setState('upload')
        return
      }
      setError({ message: 'Problème de connexion, réessaie' })
      setState('upload')
    } finally {
      setAbortController(null)
    }
  }, [])

  const handleCancel = () => {
    abortController?.abort()
    setState('upload')
  }

  const handleRegenerate = () => generate(photos)

  const handleReset = () => {
    setListing(null)
    setPhotos([])
    setError(null)
    setState('upload')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1D9E75]/5 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center text-white text-lg font-bold shadow">
            V
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">VintedAI</h1>
            <p className="text-xs text-gray-500">Génère tes annonces en 1 clic</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error?.retryAfterMs != null && (
          <div className="mb-6">
            <RateLimitBanner
              retryAfterMs={error.retryAfterMs}
              onExpire={() => setError(null)}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {state === 'upload' && (
            <PhotoUploader
              onGenerate={generate}
              loading={false}
              error={error && !error.retryAfterMs ? error.message : null}
            />
          )}

          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#1D9E75]/20 border-t-[#1D9E75] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  🤖
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">Analyse en cours...</p>
                <p className="text-sm text-gray-500 mt-1">L&apos;IA examine tes photos</p>
              </div>
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          {state === 'result' && listing && (
            <ListingForm
              listing={listing}
              onRegenerate={handleRegenerate}
              onReset={handleReset}
            />
          )}
        </div>

        {state === 'upload' && (
          <p className="text-center text-xs text-gray-400 mt-6">
            5 générations gratuites par heure · Propulsé par Claude Sonnet
          </p>
        )}
      </div>
    </main>
  )
}
