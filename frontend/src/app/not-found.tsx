/**
 * Page 404 personnalisée pour les routes non trouvées
 * @module app/not-found
 */
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { Search } from 'lucide-react';

/**
 * Page 404 - Non trouvé
 * @returns Page 404 personnalisée
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mx-auto h-24 w-24 text-blue-600 mb-4">
          <Search className="h-full w-full" />
          <span className="absolute text-3xl font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            404
          </span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Page non trouvée</h1>
        
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Retour
          </Button>
          
          <Link href="/dashboard">
            <Button variant="primary">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}