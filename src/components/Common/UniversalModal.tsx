import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type Action = {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
};

const UniversalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  Icon?: any;
  children?: React.ReactNode;
  actions?: Action[];
  maxWidthClass?: string;
  hideHeaderClose?: boolean;
}> = ({ isOpen, onClose, title, description, Icon, children, actions, maxWidthClass = 'sm:max-w-4xl', hideHeaderClose = false }) => {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full h-full sm:h-auto sm:max-h-[90vh] ${maxWidthClass} bg-white/95 dark:bg-gray-800/95 rounded-t-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in-0 duration-200`}>
        <div className="sm:hidden w-full flex items-center justify-center p-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className={`text-white p-4 sm:p-5 flex items-center justify-between ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center">
              {Icon ? <Icon size={22} /> : null}
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              {description && <p className="text-sm text-white/80">{description}</p>}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {actions && actions.map((a, i) => (
              <button key={i} onClick={a.onClick} type={a.type || 'button'} className={`px-4 py-3 sm:px-3 sm:py-2 rounded-lg transition-colors ${a.variant === 'primary' ? 'bg-white text-blue-600 dark:bg-white dark:text-blue-700' : a.variant === 'ghost' ? 'bg-white/10 text-white/90' : 'bg-white/10 text-white/90'}`}>
                {a.label}
              </button>
            ))}
            {!hideHeaderClose && (
              <button onClick={onClose} title="Close" className="ml-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          {/* inner container styled like SettingsDropdown content for professional look and full dark text */}
          <div className="bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm max-h-[72vh] sm:max-h-[64vh] overflow-y-auto text-gray-800 dark:text-white">
            {children}
          </div>
        </div>

        {/* Mobile footer actions */}
        {actions && (
          <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between gap-3">
            {actions.map((a, i) => (
              <button key={i} onClick={a.onClick} type={a.type || 'button'} className={`flex-1 px-4 py-2 rounded-lg ${a.variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white'}`}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalModal;
