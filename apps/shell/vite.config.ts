import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/AllGames/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'AllGames',
        short_name: 'AllGames',
        description: 'Simple browser games. No registration, no ads. Your progress stays on this device.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/AllGames/',
        scope: '/AllGames/',
        orientation: 'portrait-primary',
        categories: ['games', 'entertainment'],
        icons: [
          {
            src: '/AllGames/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/AllGames/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  optimizeDeps: {
    exclude: [
      '@allgames/tic-tac-toe',
      '@allgames/snake',
      '@allgames/checkers',
      '@allgames/chess',
      '@allgames/minesweeper',
      '@allgames/2048',
      '@allgames/memory',
      '@allgames/sudoku',
      '@allgames/sea-battle',
      '@allgames/solitaire',
      '@allgames/ui',
    ],
  },
})
