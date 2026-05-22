'use client'

import { useState } from 'react'

export interface Annonce {
  id: string
  titre: string
  description?: string | null
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
  const [showDetail, setShowDetail] = useState(false)
  const [prixVente, setPrixVente] = useState(String(annonce.prix_suggere))
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = [
      annonce.titre,
      '',
      annonce.description ?? '',
      '',
      `Marque : ${annonce.marque}`,
      `Taille : ${annonce.taille}`,
      `État : ${annonce.etat}`,
      `Couleur : ${annonce.couleur}`,
      `Prix : ${annonce.prix_suggere}€`,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-0 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetail(true)}
      >
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
            <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
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

      {/* Modal détail */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Photo grande */}
            {annonce.photo_url && (
              <div className="w-full aspect-[4/3] bg-gray-100 flex-shrink-0">
                <img src={annonce.photo_url} alt={annonce.titre} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-base leading-snug">{annonce.titre}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut.color}`}>
                      {statut.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(annonce.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-[#1D9E75]">
                    {annonce.statut === 'vendue' && annonce.prix_vente
                      ? `${annonce.prix_vente}€`
                      : `${annonce.prix_suggere}€`}
                  </p>
                  {annonce.statut === 'vendue' && annonce.prix_vente && annonce.prix_vente !== annonce.prix_suggere && (
                    <p className="text-xs text-gray-400 line-through">{annonce.prix_suggere}€</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[annonce.marque, annonce.categorie, annonce.taille, annonce.etat, annonce.couleur]
                  .filter(Boolean)
                  .map((v, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{v}</span>
                  ))}
              </div>

              {/* Description */}
              {annonce.description && (
                <div className="mb-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{annonce.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors ${
                    copied ? 'bg-green-500' : 'bg-[#1D9E75] hover:bg-[#178a64]'
                  }`}
                >
                  {copied ? '✓ Copié !' : 'Copier l\'annonce'}
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
