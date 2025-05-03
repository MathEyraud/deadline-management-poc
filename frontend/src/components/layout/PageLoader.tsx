// src/components/layout/PageLoader.tsx

/**
 * Composant PageLoader
 * Affiche un loader durant les transitions de navigation entre les pages
 * @module components/layout/PageLoader
 */
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/ui';

/**
 * Props pour le composant PageLoader
 */
interface PageLoaderProps {
  /** Variante du loader à utiliser */
  variant?: 'spinner' | 'dots' | 'pulse' | 'logo';
  /** Si le loader doit être affiché en plein écran ou juste en barre supérieure */
  mode?: 'fullscreen' | 'topbar';
}

/**
 * Composant PageLoader - Affiche un loader durant les transitions de navigation
 * @param props - Propriétés du composant
 * @returns Composant PageLoader
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ 
  variant = 'logo', 
  mode = 'topbar' 
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Surveiller les changements de route
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const startLoading = () => {
      setIsLoading(true);
    };
    
    const stopLoading = () => {
      // Petit délai pour éviter les flashs de loader sur les navigations rapides
      timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };
    
    startLoading();
    stopLoading();
    
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname, searchParams]);
  
  if (!isLoading) return null;
  
  // Mode barre supérieure
  if (mode === 'topbar') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden">
        <div className="h-full bg-blue-600 animate-loading-bar" />
      </div>
    );
  }
  
  // Mode plein écran avec notre composant Loader
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
      <Loader 
        variant={variant}
        size="lg"
        color="primary"
        text="Chargement..."
      />
    </div>
  );
};

export default PageLoader;