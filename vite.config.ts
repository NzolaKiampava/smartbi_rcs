import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // enable plugin during dev for easier testing
      devOptions: {
        enabled: true,
        /*
          navigateFallbackAllowlist can be used to control which routes
          should fallback to index.html during SPA navigation in dev.
        */
      },
      manifest: {
        name: 'SmartBI',
        short_name: 'SmartBI',
        description: 'Business Intelligence dashboard - PWA enabled',
        theme_color: '#111827',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/icons/pwa-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          // keep references to existing raster assets as fallbacks
          { src: '/LOGOTIPO-BANKING-1536x1534.png', sizes: '192x192', type: 'image/png' },
          { src: '/LOGOTIPO-IT-DATA-1943x2048.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: '/',
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
