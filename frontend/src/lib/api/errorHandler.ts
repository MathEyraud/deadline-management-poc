/**
 * Gestionnaire d'erreurs centralisé pour les requêtes API
 * Normalise toutes les erreurs HTTP et réseau en un format cohérent
 * Fournit des utilitaires pour l'affichage des messages d'erreur
 * @module lib/api/errorHandler
 */
import { AxiosError } from 'axios';

/**
 * Interface pour les erreurs API structurées
 */
export interface ApiError {
  /** Code HTTP de l'erreur */
  status: number;
  
  /** Message d'erreur */
  message: string;
  
  /** Chemin de la requête qui a échoué */
  path?: string;
  
  /** Horodatage de l'erreur */
  timestamp?: string;
  
  /** Nom technique de l'erreur */
  errorName?: string;
  
  /** Code d'erreur spécifique (si fourni par le backend) */
  errorCode?: string;
  
  /** Erreur originale */
  originalError?: Error | unknown;
}

/**
 * Types d'erreurs spécifiques à l'application
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  SERVER = 'SERVER_ERROR',
  AUTH = 'AUTHENTICATION_ERROR',
  FORBIDDEN = 'FORBIDDEN_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Gère une erreur API et la normalise vers un format standard
 * @param error - L'erreur à traiter (généralement une AxiosError)
 * @returns Erreur API normalisée
 */
export const handleApiError = (error: unknown): ApiError => {
  // Cas d'une erreur Axios
  if (error instanceof AxiosError && error.response) {
    const { status, data } = error.response;
    
    // Si le backend a renvoyé une structure d'erreur conforme
    if (data && typeof data === 'object') {
      return {
        status,
        message: data.message || 'Une erreur s\'est produite',
        path: data.path,
        timestamp: data.timestamp,
        errorName: data.errorName,
        errorCode: data.errorCode,
        originalError: error
      };
    }
    
    // Si le backend a renvoyé un message simple
    return {
      status,
      message: typeof data === 'string' ? data : `Erreur ${status}`,
      originalError: error
    };
  }
  
  // Erreur liée à la requête (pas de réponse du serveur)
  if (error instanceof AxiosError && error.request) {
    // Déterminer si c'est un timeout
    if (error.code === 'ECONNABORTED') {
      return {
        status: 0,
        message: 'La requête a pris trop de temps à répondre. Veuillez réessayer.',
        errorName: ErrorType.TIMEOUT,
        originalError: error
      };
    }
    
    return {
      status: 0,
      message: 'Le serveur ne répond pas. Veuillez vérifier votre connexion ou réessayer plus tard.',
      errorName: ErrorType.NETWORK,
      originalError: error
    };
  }
  
  // Autres types d'erreurs
  return {
    status: 500,
    message: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite',
    errorName: ErrorType.UNKNOWN,
    originalError: error
  };
};

/**
 * Affiche une erreur API de manière utilisable pour l'utilisateur
 * @param error - L'erreur à afficher (ApiError ou autre)
 * @returns Message d'erreur lisible par un humain
 */
export const getReadableErrorMessage = (error: ApiError | unknown): string => {
  const apiError = error instanceof Object && 'status' in error && 'message' in error
    ? error as ApiError
    : handleApiError(error);

  // Messages spécifiques selon le code d'erreur
  switch (apiError.status) {
    case 400:
      return `Données invalides: ${apiError.message}`;
    case 401:
      return 'Vous devez vous connecter pour accéder à cette ressource';
    case 403:
      return 'Vous n\'avez pas les permissions nécessaires pour cette action';
    case 404:
      return `Ressource non trouvée: ${apiError.message}`;
    case 409:
      return `Conflit: ${apiError.message}`;
    case 422:
      return `Validation échouée: ${apiError.message}`;
    case 429:
      return 'Trop de requêtes. Veuillez réessayer plus tard.';
    case 0:
      return apiError.errorName === ErrorType.TIMEOUT 
        ? 'La requête a expiré. Veuillez réessayer.' 
        : 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.';
    default:
      return apiError.message || 'Une erreur inconnue s\'est produite';
  }
};

/**
 * Détermine si une erreur est liée à l'authentification (401)
 * @param error - L'erreur à vérifier
 * @returns true si c'est une erreur d'authentification
 */
export const isAuthError = (error: unknown): boolean => {
  const apiError = error instanceof Object && 'status' in error 
    ? error as ApiError 
    : handleApiError(error);
    
  return apiError.status === 401;
};

export default handleApiError;