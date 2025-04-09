/**
 * Hook personnalisé pour gérer les erreurs API de manière standardisée
 * Fournit des fonctions utilitaires pour afficher et gérer les erreurs
 * @module hooks/useApiError
 */
import { useState, useCallback } from 'react';
import { useNotifications } from '@/app/providers';
import { ApiError, ErrorType, getReadableErrorMessage } from '@/lib/api/errorHandler';

/**
 * Options pour le hook useApiError
 */
interface UseApiErrorOptions {
  /** Redirection automatique vers la page de connexion en cas d'erreur d'authentification */
  redirectOnAuthError?: boolean;
}

/**
 * Interface pour les résultats du hook
 */
export interface UseApiErrorResult {
  /** Erreur actuelle */
  error: ApiError | null;
  
  /** Message d'erreur lisible */
  errorMessage: string | null;
  
  /** Fonction pour définir une erreur */
  setError: (error: unknown) => void;
  
  /** Fonction pour effacer l'erreur */
  clearError: () => void;
  
  /** Fonction pour vérifier si une erreur est d'un certain type */
  isErrorType: (type: ErrorType) => boolean;
}

/**
 * Hook pour gérer les erreurs API de manière standardisée
 * @param options - Options de configuration
 * @returns Fonctions et états pour gérer les erreurs API
 */
export function useApiError(options: UseApiErrorOptions = {}): UseApiErrorResult {
  const { redirectOnAuthError = true } = options;
  const [error, setErrorState] = useState<ApiError | null>(null);
  const { showNotification } = useNotifications();
  
  /**
   * Définit l'erreur courante
   * @param rawError - Erreur brute à traiter
   */
  const setError = useCallback((rawError: unknown) => {
    // Convertir l'erreur brute en ApiError normalisée
    const apiError = rawError && typeof rawError === 'object' && 'status' in rawError
      ? rawError as ApiError
      : {
          status: 500,
          message: rawError instanceof Error ? rawError.message : 'Une erreur inconnue s\'est produite',
          errorName: ErrorType.UNKNOWN,
          originalError: rawError
        };
    
    // Stocker l'erreur normalisée
    setErrorState(apiError);
    
    // Afficher une notification d'erreur
    showNotification(
      getReadableErrorMessage(apiError),
      'error'
    );
    
    // Redirection conditionnelle pour les erreurs d'authentification
    if (redirectOnAuthError && apiError.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?expired=true';
      }
    }
    
    // Log de l'erreur en développement
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', apiError);
    }
  }, [showNotification, redirectOnAuthError]);
  
  /**
   * Efface l'erreur courante
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);
  
  /**
   * Vérifie si l'erreur courante est d'un certain type
   * @param type - Type d'erreur à vérifier
   * @returns true si l'erreur est du type spécifié
   */
  const isErrorType = useCallback((type: ErrorType) => {
    return error?.errorName === type;
  }, [error]);
  
  return {
    error,
    errorMessage: error ? getReadableErrorMessage(error) : null,
    setError,
    clearError,
    isErrorType,
  };
}

export default useApiError;