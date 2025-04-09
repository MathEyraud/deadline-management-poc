/**
 * Page d'entrée de l'application
 * Redirige vers le tableau de bord ou la page de connexion en fonction de l'état d'authentification
 * Point d'entrée principal de l'application
 * @module app/page
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Page d'entrée
 * Redirige automatiquement vers la destination appropriée
 * @returns Page d'entrée avec redirection
 */
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}