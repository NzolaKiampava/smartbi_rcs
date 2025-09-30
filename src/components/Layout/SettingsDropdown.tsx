import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Lock,
  Bell,
  Building2,
  Link,
  FileText,
  // Sliders removed (preferences panel removed)
  Layout as LayoutIcon,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings, SUPPORTED_LANGUAGES } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

type PanelKey =
  | 'main'
  | 'profile'
  | 'password'
  | 'notifications'
  | 'security'
  | 'organization'
  | 'integrations'
  | 'reports'
  // preferences removed
  | 'layout'
  | 'billing';

interface SettingsState {
  language: string;
  theme: 'light' | 'dark';
  defaultDashboard: string;
  menuPosition: 'left' | 'right' | 'top';
  timezone: string;
  currency: string;
}


const useOutsideClose = (ref: React.RefObject<HTMLDivElement>, onClose: () => void, open: boolean) => {
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onClose, open]);
};

const SettingsDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useOutsideClose(panelRef, onClose, isOpen);
  const { toggleTheme, isDark } = useTheme();

  const { settings, updateSettings, setMenuPosition, settingsPanel, setSettingsPanel } = useSettings();
  const { updateProfile, user } = useAuth();
  const [panel, setPanel] = useState<PanelKey>('main');
  const [visible, setVisible] = useState(isOpen);
  const { t } = useTranslation();

  // local working copy and persisted settings
  const [state, setState] = useState<SettingsState>(() => ({ ...settings }));

  // keep a snapshot to allow cancel/revert
  const [snapshot, setSnapshot] = useState(state);

  // temporary profile edit state (separate from settings)
  const [profileTemp, setProfileTemp] = useState<{ firstName?: string; lastName?: string; email?: string; role?: string; avatarPreview?: string }>(() => ({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    role: user?.role,
    avatarPreview: localStorage.getItem('smartbi_avatar_preview') || undefined,
  }));

  const [profileSnapshot, setProfileSnapshot] = useState(profileTemp);
  const [profileErrors, setProfileErrors] = useState<{ firstName?: string; email?: string }>({});

  // initialize the dialog when it opens. Keep dependencies minimal so
  // user interactions (changing inputs, theme, etc.) don't force the
  // panel back to 'main' unexpectedly.
  useEffect(() => {
    setVisible(isOpen);
    if (!isOpen) return;

    // if a specific panel is requested via SettingsContext, open that panel
    if (settingsPanel) {
      setPanel(settingsPanel as PanelKey);
      // clear requested panel after using it
      setSettingsPanel(null);
    } else {
      setPanel('main');
    }

    setSnapshot(state);

    // initialize profile temp from user and stored avatar preview
    const initialProfile = {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      role: user?.role,
      avatarPreview: localStorage.getItem('smartbi_avatar_preview') || undefined,
    };
    setProfileTemp(initialProfile);
    setProfileSnapshot(initialProfile);
  }, [isOpen, settingsPanel, setSettingsPanel]);

  // when theme changes at global level, keep state in sync
  useEffect(() => {
    setState(s => ({ ...s, theme: isDark ? 'dark' : 'light' }));
  }, [isDark]);

  const save = (next: SettingsState) => {
    setState(next);
    updateSettings(next);
    // apply theme immediately
    if (next.theme !== (localStorage.getItem('smartbi_theme') as 'light' | 'dark')) {
      // toggleTheme flips, so call only when different
      if ((next.theme === 'dark') !== isDark) toggleTheme();
      localStorage.setItem('smartbi_theme', next.theme);
    }
  };

  const applyThemeImmediate = (themeChoice: 'light' | 'dark') => {
    const next = { ...state, theme: themeChoice };
    setState(next);
    // ensure localStorage and ThemeContext are in sync immediately
    if ((themeChoice === 'dark') !== isDark) toggleTheme();
    localStorage.setItem('smartbi_theme', themeChoice);
  };

  const handleApply = () => {
    save(state);
    setSnapshot(state);
  };

  const handleOK = () => {
    handleApply();
    onClose();
  };

  const handleCancel = () => {
    // revert to snapshot
    setState(snapshot);
    if (snapshot.theme !== (localStorage.getItem('smartbi_theme') as 'light' | 'dark')) {
      if ((snapshot.theme === 'dark') !== isDark) toggleTheme();
      localStorage.setItem('smartbi_theme', snapshot.theme);
    }
    onClose();
  };

  useEffect(() => {
    if (visible && panelRef.current) {
      // focus for accessibility (trap would be better but this is lightweight)
      panelRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  const MenuItem: React.FC<{ icon: React.ComponentType<Record<string, unknown>>; label: string; keyName: PanelKey }> = ({ icon: Icon, label, keyName }) => (
    <button
      onClick={() => setPanel(keyName)}
      className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
    >
      <Icon size={18} className="text-gray-500 dark:text-gray-300 mr-3" />
      <span className="text-sm font-medium text-gray-700 dark:text-white">{label}</span>
      <ChevronRight size={16} className="ml-auto text-gray-400" />
    </button>
  );

  // Small animated preview for layout choices
  const LayoutPreview: React.FC<{ position: 'left' | 'right' | 'top'; active?: boolean }> = ({ position, active }) => {
    const base = 'rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden';
    if (position === 'top') {
      return (
        <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.28 }} className={`w-full h-28 p-2 ${base}`}>
          <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-sm mb-2 relative overflow-hidden">
            <div className={`absolute inset-y-0 left-0 w-1/3 bg-blue-500/60 dark:bg-blue-400/40 transition-all ${active ? 'translate-x-0' : '-translate-x-full'} transform`} style={{ transitionDuration: '500ms' }} />
          </div>
          <div className="h-16 bg-gray-50 dark:bg-gray-900 rounded-sm flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">Top menu + content</div>
        </motion.div>
      );
    }

    if (position === 'right') {
      return (
        <motion.div initial={{ x: 6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.28 }} className={`w-full h-28 p-2 ${base}`}>
          <div className="flex h-full">
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-l-sm flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">Content</div>
            <div className="w-20 bg-gray-100 dark:bg-gray-700 rounded-r-sm relative overflow-hidden">
              <div className={`absolute inset-x-0 top-0 h-1 bg-blue-500/60 dark:bg-blue-400/40 ${active ? 'animate-pulse' : ''}`} />
              <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">Menu</div>
            </div>
          </div>
        </motion.div>
      );
    }

    // left (default)
    return (
      <motion.div initial={{ x: -6, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.28 }} className={`w-full h-28 p-2 ${base}`}>
        <div className="flex h-full">
          <div className="w-20 bg-gray-100 dark:bg-gray-700 rounded-l-sm relative overflow-hidden">
            <div className={`absolute inset-x-0 top-0 h-1 bg-blue-500/60 dark:bg-blue-400/40 ${active ? 'animate-pulse' : ''}`} />
            <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">Menu</div>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-r-sm flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">Content</div>
        </div>
      </motion.div>
    );
  };

  return (
  <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
  <div onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />

      <div
        ref={panelRef}
        tabIndex={-1}
  className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl bg-white/95 dark:bg-gray-800/95 rounded-t-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in-0 duration-200 z-[99999] pointer-events-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-full flex items-center justify-center p-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        {/* Header */}
  <div className={`text-white p-4 sm:p-5 flex items-center justify-between ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('app.settings')}</h2>
                <p className="text-sm text-white/80">{t('app.subtitle')}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={handleCancel} className="px-4 py-3 sm:px-3 sm:py-2 bg-white/10 dark:bg-white/6 rounded-lg text-white/90 hover:bg-white/20 transition-colors">Cancel</button>
            <button onClick={handleApply} className="px-4 py-3 sm:px-3 sm:py-2 bg-white text-blue-600 dark:bg-white dark:text-blue-700 rounded-lg font-medium">Apply</button>
            <button onClick={handleOK} className="ml-2 px-5 py-3 sm:px-4 sm:py-2 bg-white/90 dark:bg-white/95 text-blue-600 dark:text-blue-700 rounded-xl font-semibold">OK</button>
            <button
              onClick={onClose}
              title="Close"
              className="ml-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
          {/* Left menu (vertical on lg, hidden on small screens) */}
          <div className="col-span-1 hidden sm:block">
            <div className="space-y-2">
              <MenuItem icon={User} label={t('settings.profile') || 'Profile'} keyName="profile" />
              <MenuItem icon={Lock} label={t('settings.password') || 'Password'} keyName="password" />
              <MenuItem icon={Bell} label={t('settings.notifications') || 'Notifications'} keyName="notifications" />
              <MenuItem icon={Lock} label={t('settings.security') || 'Security'} keyName="security" />
              <MenuItem icon={Building2} label={t('settings.organization') || 'Organization'} keyName="organization" />
              <MenuItem icon={Link} label={t('settings.integrations') || 'Integrations'} keyName="integrations" />
              <MenuItem icon={FileText} label={t('settings.reports') || 'Reports'} keyName="reports" />
              {/* Preferences removed per request */}
              <MenuItem icon={LayoutIcon} label="Layout" keyName="layout" />
              <MenuItem icon={CreditCard} label="Billing" keyName="billing" />
            </div>
          </div>

          {/* Top horizontal menu on small screens */}
          <div className="sm:hidden w-full px-4 py-2 overflow-x-auto">
            <div className="flex items-center space-x-3">
              {[
                { icon: User, keyName: 'profile', label: 'Profile' },
                { icon: Lock, keyName: 'password', label: 'Password' },
                { icon: Bell, keyName: 'notifications', label: 'Notifications' },
                { icon: Lock, keyName: 'security', label: 'Security' },
                { icon: Building2, keyName: 'organization', label: 'Organization' },
                { icon: Link, keyName: 'integrations', label: 'Integrations' },
                { icon: FileText, keyName: 'reports', label: 'Reports' },
                // preferences removed
                { icon: LayoutIcon, keyName: 'layout', label: 'Layout' },
                { icon: CreditCard, keyName: 'billing', label: 'Billing' }
              ].map((it) => {
                const Icon = it.icon as React.ComponentType<{ size?: number }>;
                return (
                  <button key={it.keyName} onClick={() => setPanel(it.keyName as PanelKey)} className="flex-shrink-0 min-w-[110px] px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="truncate">{it.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right content area */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3 bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm max-h-[72vh] sm:max-h-[64vh] overflow-y-auto text-gray-800 dark:text-white">
            <div className="flex items-center mb-4">
              {panel !== 'main' && (
                <button onClick={() => setPanel('main')} className="p-2 mr-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft size={18} />
                </button>
              )}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {panel === 'main' && t('app.settings')}
                {panel === 'profile' && (t('settings.profile') || 'Profile')}
                {panel === 'password' && (t('settings.changePassword') || 'Change Password')}
                {panel === 'notifications' && (t('settings.notifications') || 'Notifications')}
                {panel === 'security' && (t('settings.security') || 'Security')}
                {panel === 'organization' && (t('settings.organization') || 'Organization')}
                {panel === 'integrations' && (t('settings.integrations') || 'Integrations')}
                {panel === 'reports' && (t('settings.reports') || 'Reports')}
                {/* preferences panel removed */}
                {panel === 'layout' && (t('settings.layout') || 'Layout')}
                {panel === 'billing' && (t('settings.billing') || 'Billing')}
              </h3>
            </div>

            <div className="transition-all duration-300">
              {panel === 'main' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-white">Appearance</h4>
                    <div className="flex items-center gap-3">
                        {/* Toggle switch for dark mode */}
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={state.theme === 'dark'}
                                onChange={(e) => applyThemeImmediate(e.target.checked ? 'dark' : 'light')}
                              />
                              <div className={`w-11 h-6 rounded-full transition-colors ${state.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${state.theme === 'dark' ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className="ml-3 text-sm text-gray-700 dark:text-white">Dark mode</span>
                          </label>

                          {/* Keep simple buttons for explicit selection */}
                          <button
                            onClick={() => applyThemeImmediate('light')}
                            className={`px-3 py-2 rounded-lg border ${state.theme === 'light' ? 'border-blue-600 bg-blue-50 dark:bg-transparent' : 'border-gray-200 dark:border-gray-700'} text-sm text-gray-800 dark:text-white bg-white dark:bg-gray-700`}
                          >
                            Light
                          </button>
                          <button
                            onClick={() => applyThemeImmediate('dark')}
                            className={`px-3 py-2 rounded-lg border ${state.theme === 'dark' ? 'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-800 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white'} text-sm`}
                          >
                            Dark
                          </button>
                        </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-white">Preferences</h4>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-300">{t('app.language')}</label>
                      <select value={state.language} onChange={(e) => {
                        const nextLang = e.target.value;
                        setState({ ...state, language: nextLang });
                        // update SettingsContext and let the helper persist & apply language
                        updateSettings({ language: nextLang });
                        try {
                          import('../../utils/i18nHelpers').then(mod => mod.setLanguage(nextLang)).catch(() => {});
                        } catch (err) { console.error(err); }
                      }} className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white">
                        {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                      </select>

                      <label className="text-xs text-gray-500 dark:text-gray-300">Default dashboard</label>
                      <select value={state.defaultDashboard} onChange={(e) => setState({ ...state, defaultDashboard: e.target.value })} className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white">
                        <option value="overview">Overview</option>
                        <option value="analytics">Analytics</option>
                        <option value="reports">Reports</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-white">Organization</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Currency</span>
                        <select value={state.currency} onChange={(e) => setState({ ...state, currency: e.target.value })} className="rounded-lg border px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white">
                          <option>USD</option>
                          <option>EUR</option>
                          <option>AOA</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Timezone</span>
                        <select value={state.timezone} onChange={(e) => setState({ ...state, timezone: e.target.value })} className="rounded-lg border px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white">
                          <option>UTC</option>
                          <option>WAT</option>
                          <option>GMT</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-white">Integrations</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Manage database connections and external APIs on the Integrations page.</p>
                    <div className="mt-3">
                      <button onClick={() => setPanel('integrations')} className="px-3 py-2 bg-blue-50 dark:bg-blue-800 text-sm rounded-lg text-gray-800 dark:text-white">Open Integrations</button>
                    </div>
                  </div>
                </div>
              )}

              {panel === 'profile' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start mb-4">
                    <div className="col-span-1 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-gray-400">{profileTemp.avatarPreview ? <img src={profileTemp.avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : 'Avatar'}</div>
                      <label className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t('profile.uploadAvatar')}</label>
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // first try to upload to dev upload server
                        try {
                          const form = new FormData();
                          form.append('avatar', file);
                          const resp = await fetch('http://localhost:5174/upload', { method: 'POST', body: form });
                          if (resp.ok) {
                            const json = await resp.json();
                            if (json && json.url) {
                              const url = json.url as string;
                              // store the returned url in localStorage and set preview
                              try { localStorage.setItem('smartbi_avatar_preview', url); } catch (err) { console.error(err); }
                              setProfileTemp(prev => ({ ...prev, avatarPreview: url }));
                              return;
                            }
                          }
                        } catch (uploadErr) {
                          console.error('Upload server not available or upload failed, falling back to base64 preview', uploadErr);
                        }

                        // fallback to base64 preview
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string | null;
                          if (result) {
                            setProfileTemp(prev => ({ ...prev, avatarPreview: result }));
                            try { localStorage.setItem('smartbi_avatar_preview', result); } catch (err) { console.error(err); }
                          }
                        };
                        reader.readAsDataURL(file);
                      }} className="mt-2 text-xs text-gray-500 dark:text-gray-400" />
                    </div>

                    <div className="sm:col-span-2 col-span-1">
                      <div className="mb-3">
                        <label className="block text-sm text-gray-600 dark:text-gray-300">{t('profile.firstName')}</label>
                        <input value={profileTemp.firstName || ''} onChange={(e) => setProfileTemp({ ...profileTemp, firstName: e.target.value })} className="w-full rounded-lg border px-3 py-2 mt-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                        {profileErrors.firstName && <div className="text-xs text-red-600 mt-1">{profileErrors.firstName}</div>}
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm text-gray-600 dark:text-gray-300">{t('profile.lastName')}</label>
                        <input value={profileTemp.lastName || ''} onChange={(e) => setProfileTemp({ ...profileTemp, lastName: e.target.value })} className="w-full rounded-lg border px-3 py-2 mt-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm text-gray-600 dark:text-gray-300">{t('profile.email')}</label>
                        <input value={profileTemp.email || ''} onChange={(e) => setProfileTemp({ ...profileTemp, email: e.target.value })} className="w-full rounded-lg border px-3 py-2 mt-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                        {profileErrors.email && <div className="text-xs text-red-600 mt-1">{profileErrors.email}</div>}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t('profile.role')}: <span className="font-medium">{profileTemp.role || 'User'}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={async () => {
                      // validate
                      const errors: { firstName?: string; email?: string } = {};
                      if (!profileTemp.firstName || profileTemp.firstName.trim().length === 0) errors.firstName = t('profile.firstName') + ' is required';
                      const emailVal = profileTemp.email || '';
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailVal || !emailRegex.test(emailVal)) errors.email = 'Please enter a valid email';
                      setProfileErrors(errors);
                      if (Object.keys(errors).length > 0) return;

                      const patch = {
                        firstName: profileTemp.firstName,
                        lastName: profileTemp.lastName,
                        email: profileTemp.email,
                      };

                      try {
                        await updateProfile(patch);
                      } catch (err) {
                        console.error('Update profile failed', err);
                      }

                      try { updateSettings({ ...settings, ...(patch as Partial<SettingsState>) }); } catch (err) { console.error(err); }
                      setProfileSnapshot({ ...profileTemp });
                      handleApply();
                    }} className="px-4 py-2 rounded-lg bg-blue-600 text-white">{t('profile.saveProfile')}</button>
                    <button onClick={() => {
                      // revert changes from snapshot if any
                      setProfileTemp(profileSnapshot);
                    }} className="px-4 py-2 rounded-lg border">Revert</button>
                  </div>
                </div>
              )}

              {panel === 'password' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">Current password</label>
                    <input type="password" className="w-full rounded-lg border px-3 py-2 mt-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">New password</label>
                    <input type="password" className="w-full rounded-lg border px-3 py-2 mt-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">Confirm password</label>
                    <input type="password" className="w-full rounded-lg border px-3 py-2 mt-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                  </div>
                </div>
              )}

              {panel === 'notifications' && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Enable desktop notifications</label>
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => setState({ ...state })} className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100">Toggle</button>
                  </div>
                </div>
              )}

              {panel === 'security' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Two-factor authentication and session controls.</p>
                </div>
              )}

              {panel === 'organization' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Organization logo</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-20 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-700 dark:text-gray-200">Logo</div>
                      <button className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100">Upload</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-300">Manage users & permissions</label>
                    <div className="mt-2">
                      <button onClick={() => setPanel('profile')} className="px-3 py-2 bg-blue-50 dark:bg-blue-800 text-sm rounded-lg">Open User Management</button>
                    </div>
                  </div>
                </div>
              )}

              {panel === 'integrations' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">List of connected databases and APIs. Create or edit connections in the Database page.</p>
                </div>
              )}

              {panel === 'reports' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Export formats, scheduling and retention policies.</p>
                </div>
              )}

              {/* Preferences panel removed */}

              {panel === 'layout' && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">Menu position</label>
                  {/* Single preview on top */}
                  <div className="mt-3">
                    <LayoutPreview position={state.menuPosition} active />
                  </div>

                  {/* Buttons below the preview */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setState(prev => ({ ...prev, menuPosition: 'left' }));
                        setMenuPosition('left');
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${state.menuPosition === 'left' ? 'border-blue-600 bg-blue-50 dark:bg-blue-800 text-white' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'}`}>
                      Left
                    </button>

                    <button
                      onClick={() => {
                        setState(prev => ({ ...prev, menuPosition: 'right' }));
                        setMenuPosition('right');
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${state.menuPosition === 'right' ? 'border-blue-600 bg-blue-50 dark:bg-blue-800 text-white' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'}`}>
                      Right
                    </button>

                    <button
                      onClick={() => {
                        setState(prev => ({ ...prev, menuPosition: 'top' }));
                        setMenuPosition('top');
                      }}
                      className={`w-full px-3 py-2 rounded-lg border ${state.menuPosition === 'top' ? 'border-blue-600 bg-blue-50 dark:bg-blue-800 text-white' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white'}`}>
                      Top
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile action footer */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between gap-3">
        <button onClick={handleCancel} className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white">Cancel</button>
        <button onClick={handleApply} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white">Apply</button>
        <button onClick={handleOK} className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-blue-600">OK</button>
      </div>
    </div>
  );
};

export default SettingsDropdown;
