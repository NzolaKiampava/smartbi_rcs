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
  openSettings: (panel?: string) => void;
  closeSettings: () => void;
  // optional: allow opening settings to a specific panel (e.g. 'profile')
  settingsPanel?: string | null;
  setSettingsPanel: (panel: string | null) => void;
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
  const [settingsPanel, setSettingsPanel] = useState<string | null>(null);

  // ensure the document <html lang> matches current language
  useEffect(() => {
    try {
      if (settings && settings.language) {
        document.documentElement.lang = settings.language || DEFAULTS.language;
      }
    } catch {
      // ignore
    }
  }, [settings.language]);

  useEffect(() => {
    try {
      // Persist settings but intentionally omit menuPosition so layout returns to default on page reload
  const copy: Partial<SettingsState> = { ...settings };
  delete copy.menuPosition;
      localStorage.setItem('smartbi_settings', JSON.stringify(copy));
    } catch {
      // ignore
    }
  }, [settings]);

  const updateSettings = (next: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...next }));
  };

  const setMenuPosition = (pos: MenuPosition) => {
    setSettings(prev => ({ ...prev, menuPosition: pos }));
  };

  const openSettings = (panel?: string) => {
    if (panel) setSettingsPanel(panel);
    setIsSettingsOpen(true);
  };
  const closeSettings = () => {
    setIsSettingsOpen(false);
    setSettingsPanel(null);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setMenuPosition, isSettingsOpen, openSettings, closeSettings, settingsPanel, setSettingsPanel }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
