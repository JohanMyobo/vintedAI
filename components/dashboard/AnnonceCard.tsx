'use client'

import { useState } from 'react'

export interface Annonce {
  id: string
  titre: string
  marque: string
  categorie: string
  taille: string
  etat: string
  couleur: string
  prix_suggere: number
  prix_vente?: number | null
  statut: 'active' | 'vendue' | 'reservee' | 'archivee'
  photo_url?: string | null
  created_at: string
  sold_at?: string | null
}

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  reservee:  { label: 'Réservée', color: 'bg-amber-100 text-amber-700' },
  vendue:    { label: 'Vendue',   color: 'bg-blue-100 text-blue-700' },
  archivee:  { label: 'Archivée', color: 'bg-gray-100 text-gray-500' },
}

interface Props {
  annonce: Annonce
  onUpdate: (id: string, updates: Partial<Annonce>) => void
  onDelete: (id: string) => void
}

export default function AnnonceCard({ annonce, onUpdate, onDelete }: Props) {
  const [showVenteModal, setShowVenteModal] = useState(false)
  const [prixVente, setPrixVente] = useState(String(annonce.prix_suggere))
  const [menuOpen, setMenuOpen] = useState(false)

  const statut = STATUT_LABELS[annonce.statut]

  const handleStatut = (newStatut: Annonce['statut']) => {
    setMenuOpen(false)
    if (newStatut === 'vendue') {
      setShowVenteModal(true)
      return
    }
    onUpdate(annonce.id, { statut: newStatut })
  }

  const handleVendue = () => {
    onUpdate(annonce.id, { statut: 'vendue', prix_vente: Number(prixVente) })
    setShowVenteModal(false)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-0">
        {/* Photo */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100">
          {annonce.photo_url ? (
            <img src={annonce.photo_url} alt={annonce.titre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">👗</div>
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{annonce.titre}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut.color}`}>
                  {statut.label}
                </span>
                <span className="text-xs text-gray-400">{annonce.marque}</span>
                <span className="text-xs text-gray-400">{annonce.taille}</span>
              </div>
            </div>

            {/* Actions menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 text-lg"
              >
                ⋯
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 w-40">
                  {(['active', 'reservee', 'vendue', 'archivee'] as const).map(s => (
                    s !== annonce.statut && (
                      <button
                        key={s}
                        onClick={() => handleStatut(s)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        → {STATUT_LABELS[s].label}
                      </button>
                    )
                  ))}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(annonce.id) }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="font-bold text-[#1D9E75]">
              {annonce.statut === 'vendue' && annonce.prix_vente
                ? `${annonce.prix_vente}€`
                : `${annonce.prix_suggere}€`}
            </span>
            {annonce.statut === 'vendue' && annonce.prix_vente && annonce.prix_vente !== annonce.prix_suggere && (
              <span className="text-xs text-gray-400 line-through">{annonce.prix_suggere}€</span>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(annonce.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Modal prix de vente */}
      {showVenteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <h3 className="font-bold text-gray-800 mb-1">Marquer comme vendue</h3>
            <p className="text-sm text-gray-500 mb-4">Prix de vente final ?</p>
            <div className="relative mb-4">
              <input
                type="number"
                value={prixVente}
                onChange={e => setPrixVente(e.target.value)}
                min={1}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVenteModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleVendue}
                className="flex-1 py-2 rounded-lg bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#178a64]"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
