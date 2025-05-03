/**
 * Hook personnalisé pour gérer l'état de chargement
 * @module hooks/useLoading
 */
import { useState, useCallback } from 'react';

/**
 * Interface pour les options du hook useLoading
 */
export interface UseLoadingOptions {
  /** État initial du chargement */
  initialState?: boolean;
  /** Callback à exécuter au début du chargement */
  onLoadingStart?: () => void;
  /** Callback à exécuter à la fin du chargement */
  onLoadingEnd?: () => void;
}

/**
 * Interface pour les retours du hook useLoading
 */
export interface UseLoadingReturn {
  /** État actuel du chargement */
  isLoading: boolean;
  /** Fonction pour démarrer le chargement */
  startLoading: () => void;
  /** Fonction pour arrêter le chargement */
  stopLoading: () => void;
  /** Fonction utilitaire qui entoure une promesse avec les états de chargement */
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

/**
 * Hook personnalisé pour gérer l'état de chargement
 * @param options - Options de configuration
 * @returns Fonctions et état pour la gestion du chargement
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { 
    initialState = false,
    onLoadingStart,
    onLoadingEnd
  } = options;
  
  const [isLoading, setIsLoading] = useState<boolean>(initialState);
  
  /**
   * Démarre l'état de chargement
   */
  const startLoading = useCallback(() => {
    setIsLoading(true);
    if (onLoadingStart) onLoadingStart();
  }, [onLoadingStart]);
  
  /**
   * Arrête l'état de chargement
   */
  const stopLoading = useCallback(() => {
    setIsLoading(false);
    if (onLoadingEnd) onLoadingEnd();
  }, [onLoadingEnd]);
  
  /**
   * Enveloppe une promesse avec les états de chargement
   * Active le chargement au début et le désactive à la fin (succès ou erreur)
   * @param promise - Promesse à exécuter
   * @returns Résultat de la promesse
   */
  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await promise;
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
}

export default useLoading;