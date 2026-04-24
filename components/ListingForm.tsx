'use client'

import { useState } from 'react'
import { Listing, formatForClipboard } from '@/lib/formatListing'

const CATEGORIES = [
  'Hauts', 'Bas', 'Robes', 'Manteaux & Vestes',
  'Chaussures', 'Accessoires', 'Sacs', 'Sport',
  'Lingerie', 'Maillots de bain', 'Enfant', 'Autre',
]

const ETATS = [
  'Neuf avec étiquette', 'Neuf sans étiquette',
  'Très bon état', 'Bon état', 'Satisfaisant',
]

interface Props {
  listing: Listing
  onRegenerate: () => void
  onReset: () => void
}

type SaveState = 'idle' | 'saving' | 'saved'

export default function ListingForm({ listing, onRegenerate, onReset }: Props) {
  const [form, setForm] = useState<Listing>(listing)
  const [copied, setCopied] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>(listing.id ? 'idle' : 'saved')

  const set = (field: keyof Listing) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: field === 'prix_suggere' ? Number(e.target.value) : e.target.value }))

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatForClipboard(form))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!listing.id || saveState !== 'idle') return
    setSaveState('saving')
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listing.id }),
      })
      setSaveState('saved')
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Ton annonce</h2>
          {listing.personalised && (
            <span className="text-xs bg-[#1D9E75]/10 text-[#1D9E75] font-medium px-2 py-0.5 rounded-full">
              ✨ Personnalisée
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="px-4 py-2 text-sm rounded-lg border border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white transition-colors"
          >
            ↺ Regénérer
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            + Nouvelle
          </button>
        </div>
      </div>

      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={form.titre}
          onChange={set('titre')}
          maxLength={80}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{form.titre.length}/80</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition resize-none"
        />
      </div>

      {/* Grille champs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
          <input
            type="text"
            value={form.marque}
            onChange={set('marque')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            value={form.categorie}
            onChange={set('categorie')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
          <input
            type="text"
            value={form.taille}
            onChange={set('taille')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
          <select
            value={form.etat}
            onChange={set('etat')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition bg-white"
          >
            {ETATS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
          <input
            type="text"
            value={form.couleur}
            onChange={set('couleur')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
          <div className="relative">
            <input
              type="number"
              value={form.prix_suggere}
              onChange={set('prix_suggere')}
              min={1}
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
            copied
              ? 'bg-green-500 scale-[0.99]'
              : 'bg-[#1D9E75] hover:bg-[#178a64] active:scale-[0.99]'
          }`}
        >
          {copied ? '✓ Copié !' : 'Copier l\'annonce'}
        </button>

        {listing.id && (
          <button
            onClick={handleSave}
            disabled={saveState !== 'idle'}
            title={saveState === 'saved' ? 'Style sauvegardé — sera utilisé pour personnaliser tes prochaines annonces' : 'Sauvegarder ce style'}
            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 border ${
              saveState === 'saved'
                ? 'bg-amber-50 border-amber-300 text-amber-600 cursor-default'
                : saveState === 'saving'
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-wait'
                : 'bg-white border-gray-300 text-gray-600 hover:border-amber-400 hover:text-amber-500 active:scale-[0.99]'
            }`}
          >
            {saveState === 'saved' ? '★ Sauvegardé' : saveState === 'saving' ? '...' : '☆ Sauvegarder'}
          </button>
        )}
      </div>

      {saveState === 'saved' && listing.id && (
        <p className="text-xs text-center text-gray-400">
          ✨ Ce style sera utilisé pour personnaliser tes prochaines annonces
        </p>
      )}
    </div>
  )
}
