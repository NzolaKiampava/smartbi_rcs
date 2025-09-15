import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration = 5000) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type: 'success',
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, [removeNotification]);

  const showError = useCallback((message: string, duration = 5000) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type: 'error',
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
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
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              flex items-center p-4 rounded-xl shadow-2xl border-l-4 transform transition-all duration-500 ease-in-out
              animate-in slide-in-from-right-full max-w-md min-w-96
              backdrop-blur-sm
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
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-3 p-1.5 rounded-full transition-all duration-200 hover:bg-white/20 text-white/80 hover:text-white"
              aria-label="Fechar notificação"
              title="Fechar notificação"
            >
              <X className="w-4 h-4" />
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