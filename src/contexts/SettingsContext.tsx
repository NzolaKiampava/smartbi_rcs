import React, { createContext, useContext, useEffect, useState } from 'react';

export type MenuPosition = 'left' | 'right' | 'top';

export interface SettingsState {
  language: string;
  theme: 'light' | 'dark';
  defaultDashboard: string;
  menuPosition: MenuPosition;
  timezone: string;
  currency: string;
}

const DEFAULTS: SettingsState = {
  language: 'en',
  theme: 'light',
  defaultDashboard: 'overview',
  menuPosition: 'left',
  timezone: 'UTC',
  currency: 'USD'
};

// supported languages (code, label)
export const SUPPORTED_LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }
];

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (next: Partial<SettingsState>) => void;
  setMenuPosition: (pos: MenuPosition) => void;
  // modal control
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem('smartbi_settings');
      const parsed = raw ? JSON.parse(raw) : {};
      // Ensure menuPosition is always the default on load (transient UI preference)
      return { ...DEFAULTS, ...parsed, menuPosition: DEFAULTS.menuPosition };
    } catch {
      return DEFAULTS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ensure the document <html lang> matches current language
  useEffect(() => {
    try {
      if (settings && settings.language) {
        document.documentElement.lang = settings.language || DEFAULTS.language;
      }
    } catch (e) {
      // ignore
    }
  }, [settings.language]);

  useEffect(() => {
    try {
      // Persist settings but intentionally omit menuPosition so layout returns to default on page reload
      const { menuPosition, ...toPersist } = settings as any;
      localStorage.setItem('smartbi_settings', JSON.stringify(toPersist));
    } catch (e) {
      // ignore
    }
  }, [settings]);

  const updateSettings = (next: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...next }));
  };

  const setMenuPosition = (pos: MenuPosition) => {
    setSettings(prev => ({ ...prev, menuPosition: pos }));
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setMenuPosition, isSettingsOpen, openSettings, closeSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
