/**
 * Fournisseurs globaux de l'application
 * Configure les contextes et bibliothèques nécessaires
 * @module providers
 */
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Options pour les requêtes React Query
 */
const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Ne pas rafraîchir automatiquement lors du focus sur la fenêtre
      retry: 1, // Nombre de tentatives en cas d'échec
      staleTime: 5 * 60 * 1000, // Durée pendant laquelle les données sont considérées comme "fraîches" (5 minutes)
    },
  },
};

/**
 * Client React Query
 */
const queryClient = new QueryClient(queryClientOptions);

/**
 * Propriétés du composant Providers
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Composant Providers
 * Fournit les contextes globaux à l'application
 * @param props - Propriétés du composant
 * @returns Composant enveloppé dans les fournisseurs
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}