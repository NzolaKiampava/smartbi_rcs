// Utilities to change and read the app language programmatically.
// Ensures i18next is instructed to change language, persists the
// selection to localStorage.smartbi_settings and keeps <html lang>
// synchronized.

export async function setLanguage(lang: string): Promise<void> {
  try {
    // dynamic import to avoid bundling i18n in places that don't need it
    const i18nModule = await import('../i18n');
    const i18n = i18nModule.default;
    if (i18n && typeof i18n.changeLanguage === 'function') {
      await i18n.changeLanguage(lang);
    }
  } catch (err) {
    // if i18n isn't available for any reason, still persist and set document lang
    // swallow error but log to console for debugging
    // console.warn('i18n changeLanguage failed', err);
  }

  // persist selection in smartbi_settings
  try {
    const raw = localStorage.getItem('smartbi_settings') || '{}';
    const parsed = raw ? JSON.parse(raw) : {};
    parsed.language = lang;
    localStorage.setItem('smartbi_settings', JSON.stringify(parsed));
  } catch (err) {
    // ignore JSON/localStorage errors
  }

  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
    }
  } catch (err) {
    // ignore
  }
}

export function getLanguage(): string {
  try {
    const raw = localStorage.getItem('smartbi_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.language) return parsed.language;
    }
  } catch (err) {
    // ignore
  }
  try {
    if (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) {
      return document.documentElement.lang;
    }
  } catch (err) {}
  return 'en';
}

export async function initLanguage(): Promise<string> {
  // Ensures document.lang matches persisted or default i18n language and returns it.
  try {
    const lang = getLanguage();
    try {
      const i18nModule = await import('../i18n');
      const i18n = i18nModule.default;
      if (i18n && i18n.language !== lang && typeof i18n.changeLanguage === 'function') {
        await i18n.changeLanguage(lang);
      }
    } catch (e) {
      // ignore
    }
    try { document.documentElement.lang = lang; } catch {}
    return lang;
  } catch {
    return 'en';
  }
}

export default {
  setLanguage,
  getLanguage,
  initLanguage
};
