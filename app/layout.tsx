import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VintedAI — Génère tes annonces Vinted en 1 clic',
  description: 'Prends en photo tes vêtements, laisse l\'IA rédiger l\'annonce parfaite pour Vinted.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
