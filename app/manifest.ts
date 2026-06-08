import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Prode Mundial 2026 · Club San Martín',
    short_name: 'Prode San Martín',
    description:
      'Prode oficial del Club San Martín para el Mundial 2026. Predecí los resultados, sumá puntos y bancá la gira del club.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#073d17',
    theme_color: '#073d17',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
