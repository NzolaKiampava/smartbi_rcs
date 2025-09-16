import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Shield, Bell, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => console.log('Edit Profile') },
    { icon: Settings, label: 'Account Settings', action: () => console.log('Settings') },
    { icon: Shield, label: 'Privacy & Security', action: () => console.log('Privacy') },
    { icon: Bell, label: 'Notifications', action: () => console.log('Notifications') },
    { icon: HelpCircle, label: 'Help & Support', action: () => console.log('Help') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="fixed inset-0 bg-black bg-opacity-20" onClick={onClose} />
      
      <div 
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-80 animate-in slide-in-from-top-2 duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user?.firstName || 'User'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={16} className="text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Icon size={18} className="text-gray-400 dark:text-gray-500 mr-3" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100 dark:border-gray-700 py-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          >
            <LogOut size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 mr-3 transition-colors" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Sign Out
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            SmartBI Dashboard v2.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;