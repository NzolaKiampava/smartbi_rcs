import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  fr: { translation: fr }
};

// Determine initial language preference: prefer persisted settings, then <html lang>, then 'en'
const getInitialLanguage = () => {
  try {
    const raw = localStorage.getItem('smartbi_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.language) return parsed.language;
    }
  } catch (e) {}
  try { return typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en'; } catch { return 'en'; }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
