import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'VintedAI — Génère tes annonces Vinted en 1 clic',
  description: 'Prends en photo tes vêtements, laisse l\'IA rédiger l\'annonce parfaite pour Vinted.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VintedAI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          <meta name="theme-color" content="#1D9E75" />
        </head>
        <body className="antialiased bg-gray-50 min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
