

/**
 * Composant de gestion des erreurs globales pour Next.js App Router
 * Capture et affiche les erreurs non gérées dans l'application
 * @module app/error
 */
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Props pour le composant d'erreur
 */
interface ErrorProps {
  /** Erreur capturée */
  error: Error & { digest?: string };
  /** Fonction pour réessayer le rendu */
  reset: () => void;
}

/**
 * Composant de gestion des erreurs globales
 * @param props - Propriétés du composant
 * @returns Composant UI pour afficher et gérer les erreurs
 */
export default function Error({ error, reset }: ErrorProps) {
  // Journaliser l'erreur côté client
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Une erreur est survenue
          </h1>
          
          <p className="text-gray-500 mb-6">
            Nous avons rencontré un problème lors de l'affichage de cette page.
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 w-full">
              <div className="p-3 bg-red-50 border border-red-200 rounded text-left mb-4 overflow-auto max-h-32">
                <code className="text-xs text-red-800 whitespace-pre-wrap">
                  {error.message}
                  {error.stack ? `\n\n${error.stack}` : ''}
                </code>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Retour
            </Button>
            
            <Button
              variant="primary"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={reset}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}