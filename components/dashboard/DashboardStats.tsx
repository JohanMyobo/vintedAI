'use client'

interface Annonce {
  statut: string
  prix_vente?: number | null
  sold_at?: string | null
}

interface Props {
  annonces: Annonce[]
}

export default function DashboardStats({ annonces }: Props) {
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

  const stats = [
    { label: 'Actives', value: actives, icon: '🟢', color: 'text-green-600' },
    { label: 'Réservées', value: reservees, icon: '🟡', color: 'text-amber-600' },
    { label: 'Vendues', value: vendues.length, icon: '✅', color: 'text-blue-600' },
    { label: 'Ce mois', value: `${revenusMois}€`, icon: '📅', color: 'text-[#1D9E75]' },
    { label: 'Revenus totaux', value: `${revenusTotal}€`, icon: '💶', color: 'text-[#1D9E75]' },
    { label: 'Taux de vente', value: `${tauxConversion}%`, icon: '📊', color: 'text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-xs text-gray-500">{stat.label}</span>
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
