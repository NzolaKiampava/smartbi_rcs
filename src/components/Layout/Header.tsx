import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search, User, Menu, Sun, Moon, ChevronRight, Settings } from 'lucide-react';
import { Avatar } from '../ui';
import UserProfileModal from './UserProfileModal';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SettingsDropdown from './SettingsDropdown';
import { useSettings, SUPPORTED_LANGUAGES } from '../../contexts/SettingsContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, setActiveSection }) => {
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const { isSettingsOpen, openSettings, closeSettings, settings, updateSettings } = useSettings();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();

  // Pages available in the system
  const pages = [
    { id: 'overview', title: 'Overview', description: 'Dashboard overview with key metrics' },
    { id: 'analytics', title: 'Analytics', description: 'Business intelligence and data analysis' },
    { id: 'file-upload', title: 'File Upload', description: 'Upload and manage data files' },
    { id: 'natural-query', title: 'Natural Language Query', description: 'Query data using natural language' },
   // { id: 'reports', title: 'Reports', description: 'Generate and view reports' },
    { id: 'performance', title: 'Performance', description: 'System performance monitoring' },
    { id: 'notifications', title: 'Notifications', description: 'View system notifications' },
    { id: 'query-history', title: 'Query History', description: 'History of executed queries' },
    { id: 'users', title: 'Users', description: 'User management and administration' },
    { id: 'database', title: 'Database', description: 'Database connections and management' }
  ];

  // Filter pages based on search query
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handlePageSelect = (pageId: string) => {
    setActiveSection(pageId);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Mock notifications data
  const [notifications, setNotifications] = React.useState([
    {
      id: '1',
      title: 'System Performance Alert',
      message: 'Database response time has increased by 15% in the last hour.',
      type: 'warning' as const,
      timestamp: '2024-01-18T10:30:00Z',
      read: false,
      priority: 'high' as const,
      category: 'performance' as const,
      actionUrl: '/performance'
    },
    {
      id: '2',
      title: 'New User Registration',
      message: 'Sarah Johnson has registered and is pending approval.',
      type: 'info' as const,
      timestamp: '2024-01-18T09:45:00Z',
      read: false,
      priority: 'medium' as const,
      category: 'user' as const
    },
    {
      id: '3',
      title: 'Data Export Completed',
      message: 'Your Q4 2023 sales report export has been completed.',
      type: 'success' as const,
      timestamp: '2024-01-18T09:15:00Z',
      read: true,
      priority: 'low' as const,
      category: 'data' as const
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="hidden md:flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SmartBI</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">Dashboard</span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              onBlur={handleSearchBlur}
              placeholder={t('app.search_placeholder', 'Search pages...')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && filteredPages.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageSelect(page.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {page.description}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {showSuggestions && searchQuery.length > 0 && filteredPages.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 px-4 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No pages found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-3 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md sm:rounded-full transition-colors flex flex-col items-center"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-[10px] mt-1 sm:hidden text-gray-700 dark:text-gray-200">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-3 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md sm:rounded-full transition-colors flex flex-col items-center"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <span className="text-[10px] mt-1 sm:hidden text-gray-700 dark:text-gray-200">Alerts</span>
          </button>
          <button
            onClick={() => openSettings()}
            className="p-3 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md sm:rounded-full transition-colors flex flex-col items-center"
            title="Settings"
          >
            <Settings size={20} />
            <span className="text-[10px] mt-1 sm:hidden text-gray-700 dark:text-gray-200">Settings</span>
          </button>
          {/* Quick language selector */}
          <div className="hidden sm:flex items-center ml-2">
            <select
              value={settings?.language || 'en'}
              onChange={(e) => {
                const next = e.target.value;
                updateSettings({ language: next });
                try { document.documentElement.lang = next; } catch (err) {}
                try { import('../../i18n').then(i18n => i18n.default.changeLanguage(next)); } catch (err) {}
              }}
              className="text-sm rounded-lg border px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white"
              aria-label="Language"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          
          <div
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-2 sm:p-2 transition-colors flex-col sm:flex-row items-center"
            onClick={() => setProfileModalOpen(true)}
          >
            <Avatar src={(typeof window !== 'undefined' && localStorage.getItem('smartbi_avatar_preview')) || user?.avatar || null} name={`${user?.firstName || ''} ${user?.lastName || ''}`} />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
            </div>
            <span className="text-[10px] mt-1 sm:hidden text-gray-700 dark:text-gray-200">Profile</span>
          </div>
        </div>
      </div>
    </header>
      
      <UserProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      
      <NotificationsDropdown
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
      />
  <SettingsDropdown isOpen={isSettingsOpen} onClose={() => closeSettings()} />
    </>
  );
};

export default Header;