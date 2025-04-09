/**
 * Fournisseurs globaux de l'application
 * Configure React Query et autres contextes pour toute l'application
 * Point central de gestion des états et contextes globaux
 * @module app/providers
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode, createContext, useContext } from 'react';

// Contexte pour les notifications globales
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Composant qui fournit les contextes globaux à l'application
 * Inclut React Query et le système de notifications
 * @param {Object} props - Propriétés du composant
 * @param {ReactNode} props.children - Enfants du composant
 * @returns {JSX.Element} Fournisseurs de contexte
 */
export function Providers({ children }: { children: ReactNode }) {
  // Création d'une nouvelle instance de QueryClient avec configuration standardisée
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        // La gestion d'erreur centralisée sera faite au niveau des hooks individuels
      },
    }
  }));

  // État pour les notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Afficher une notification
  const showNotification = (
    message: string, 
    type: NotificationType = 'info', 
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    
    // Auto-fermeture après duration ms
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
  };

  // Masquer une notification par son ID
  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationContext.Provider 
        value={{ notifications, showNotification, hideNotification }}
      >
        {children}
        {/* Affichage des notifications */}
        <NotificationsContainer />
        {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
      </NotificationContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Hook pour utiliser le contexte de notification
 * @returns {NotificationContextType} Contexte de notification
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

/**
 * Composant pour afficher les notifications
 * @returns {JSX.Element} Conteneur de notifications
 */
const NotificationsContainer = () => {
  const { notifications, hideNotification } = useNotifications();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`px-4 py-3 rounded-lg shadow-md flex items-start justify-between max-w-xs animate-fade-in
            ${notification.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 
              notification.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' : 
              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
              'bg-blue-100 text-blue-800 border-blue-300'
            }`}
        >
          <span>{notification.message}</span>
          <button 
            onClick={() => hideNotification(notification.id)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};