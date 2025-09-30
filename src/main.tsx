import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
// Ensure persisted language is applied on startup (non-blocking)
try {
  import('./utils/i18nHelpers').then(mod => mod.initLanguage().catch(() => {})).catch(() => {});
} catch {}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA (only in production)
if (import.meta.env.PROD) {
  // vite-plugin-pwa exposes a helper at runtime; dynamic import keeps it optional in dev
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {
    // If the virtual module isn't available (dev/test), try to register a simple sw fallback
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // swallow registration errors in dev
      });
    }
  });
}
