'use client'

import { useState } from 'react'

interface Annonce {
  statut: string
  categorie?: string | null
  prix_vente?: number | null
  prix_suggere?: number | null
  sold_at?: string | null
}

interface Props {
  annonces: Annonce[]
}

export default function DashboardStats({ annonces }: Props) {
  const [showCategories, setShowCategories] = useState(false)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const actives = annonces.filter(a => a.statut === 'active').length
  const reservees = annonces.filter(a => a.statut === 'reservee').length
  const vendues = annonces.filter(a => a.statut === 'vendue')
  const revenusTotal = vendues.reduce((sum, a) => sum + (a.prix_vente ?? 0), 0)
  const revenusMois = vendues
    .filter(a => a.sold_at && new Date(a.sold_at) >= startOfMonth)
    .reduce((sum, a) => sum + (a.prix_vente ?? 0), 0)
  const tauxConversion = annonces.length > 0
    ? Math.round((vendues.length / annonces.length) * 100)
    : 0

  // Stats par catégorie
  const categories = Array.from(new Set(annonces.map(a => a.categorie).filter(Boolean))) as string[]
  const statsByCategory = categories
    .map(cat => {
      const items = annonces.filter(a => a.categorie === cat)
      const venduescat = items.filter(a => a.statut === 'vendue')
      return {
        cat,
        actives: items.filter(a => a.statut === 'active').length,
        vendues: venduescat.length,
        revenus: venduescat.reduce((sum, a) => sum + (a.prix_vente ?? 0), 0),
        total: items.length,
      }
    })
    .filter(s => s.total > 0)
    .sort((a, b) => b.total - a.total)

  const stats = [
    { label: 'Actives',       value: actives,           icon: '🟢', color: 'text-green-600' },
    { label: 'Réservées',     value: reservees,          icon: '🟡', color: 'text-amber-600' },
    { label: 'Vendues',       value: vendues.length,     icon: '✅', color: 'text-blue-600' },
    { label: 'Ce mois',       value: `${revenusMois}€`,  icon: '📅', color: 'text-[#1D9E75]' },
    { label: 'Revenus totaux',value: `${revenusTotal}€`, icon: '💶', color: 'text-[#1D9E75]' },
    { label: 'Taux de vente', value: `${tauxConversion}%`, icon: '📊', color: 'text-purple-600' },
  ]

  return (
    <div className="mb-6 space-y-3">
      {/* Chiffres globaux */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-xs text-gray-500 truncate">{stat.label}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toggle stats par catégorie */}
      {statsByCategory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowCategories(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>📂</span> Stats par catégorie
            </span>
            <span className={`text-gray-400 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {showCategories && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                    <th className="text-left px-4 py-2 font-medium">Catégorie</th>
                    <th className="text-center px-3 py-2 font-medium">Actives</th>
                    <th className="text-center px-3 py-2 font-medium">Vendues</th>
                    <th className="text-center px-3 py-2 font-medium">Taux</th>
                    <th className="text-right px-4 py-2 font-medium">Revenus</th>
                  </tr>
                </thead>
                <tbody>
                  {statsByCategory.map((s, i) => (
                    <tr key={s.cat} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{s.cat}</td>
                      <td className="px-3 py-2.5 text-center text-green-600 font-semibold">{s.actives}</td>
                      <td className="px-3 py-2.5 text-center text-blue-600 font-semibold">{s.vendues}</td>
                      <td className="px-3 py-2.5 text-center text-purple-600">
                        {s.total > 0 ? `${Math.round((s.vendues / s.total) * 100)}%` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-[#1D9E75]">
                        {s.revenus > 0 ? `${s.revenus}€` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
