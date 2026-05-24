import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VintedAI',
    short_name: 'VintedAI',
    description: 'Génère tes annonces Vinted en 1 clic',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1D9E75',
    orientation: 'portrait',
    icons: [
      { src: '/api/icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/api/icon/512', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }
}
