import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showSuccess: (message: string, duration?: number, priority?: 'high' | 'low') => void;
  showError: (message: string, duration?: number, priority?: 'high' | 'low') => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration = 5000, priority: 'high' | 'low' = 'low') => {
    // Only show high priority notifications to reduce noise
    if (priority !== 'high') {
      return;
    }

    // Evita notificações duplicadas com a mesma mensagem nos últimos 1000ms
    setNotifications(prev => {
      const now = Date.now();
      const existingNotification = prev.find(n => 
        n.message === message && 
        n.type === 'success' && 
        (now - parseInt(n.id.split('-')[1])) < 1000
      );
      
      if (existingNotification) {
        return prev;
      }

      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        type: 'success',
        message,
        duration
      };

      // Auto remove after duration
      setTimeout(() => {
        removeNotification(id);
      }, duration);

      return [...prev, notification];
    });
  }, [removeNotification]);

  const showError = useCallback((message: string, duration = 5000, priority: 'high' | 'low' = 'high') => {
    // Always show errors, but apply duplicate filtering
    // Evita notificações duplicadas com a mesma mensagem nos últimos 1000ms
    setNotifications(prev => {
      const now = Date.now();
      const existingNotification = prev.find(n => 
        n.message === message && 
        n.type === 'error' && 
        (now - parseInt(n.id.split('-')[1])) < 1000
      );
      
      if (existingNotification) {
        return prev;
      }

      const id = `notification-${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        type: 'error',
        message,
        duration
      };

      // Auto remove after duration
      setTimeout(() => {
        removeNotification(id);
      }, duration);

      return [...prev, notification];
    });
  }, [removeNotification]);

  const value = {
    showSuccess,
    showError,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-3 pointer-events-none max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              flex items-center p-4 rounded-xl shadow-2xl border-l-4 transform transition-all duration-500 ease-in-out
              animate-in slide-in-from-right-full w-full
              backdrop-blur-sm pointer-events-auto
              ${notification.type === 'success' 
                ? 'bg-green-500 border-green-600 text-white shadow-green-500/50' 
                : 'bg-red-500 border-red-600 text-white shadow-red-500/50'
              }
            `}
          >
            <div className="flex-shrink-0 mr-4">
              {notification.type === 'success' ? (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="flex-shrink-0 ml-3 p-1.5 rounded-full transition-all duration-200 hover:bg-white/20 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              aria-label="Fechar notificação"
              title="Fechar notificação"
              type="button"
            >
              <X className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};