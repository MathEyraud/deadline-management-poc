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
  status: number;                       // Code HTTP de l'erreur
  message: string;                      // Message d'erreur
  path?: string;                        // Chemin de la requête qui a échoué
  timestamp?: string;                   // Horodatage de l'erreur
  errorName?: string;                   // Nom technique de l'erreur
  errorCode?: string;                   // Code d'erreur spécifique (si fourni par le backend)
  originalError?: Error | unknown;      // Erreur originale
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
 * Extrait les données d'une réponse d'erreur
 * @param data - Données de réponse à traiter
 * @returns Partie des données d'erreur API
 */
const extractErrorData = (data: any): Partial<ApiError> => {
  if (!data) return {};
  
  if (typeof data === 'string') {
    return { message: data };
  }
  
  if (typeof data === 'object') {
    return {
      message: data.message || 'Une erreur s\'est produite',
      path: data.path,
      timestamp: data.timestamp,
      errorName: data.errorName,
      errorCode: data.errorCode,
    };
  }
  
  return {};
};

/**
 * Traite les erreurs HTTP avec une réponse
 * @param error - Erreur Axios avec réponse
 * @returns Erreur API normalisée
 */
const handleResponseError = (error: AxiosError): ApiError => {

  const { status, data } = error.response || { status: 500, data: null };
  const errorData = extractErrorData(data);
  
  // Gestion spécifique des erreurs 403 pour les échéances
  if (status === 403) {
    const isDeadlineAccess = error.config?.url?.includes('deadlines');
    
    return {
      status,
      message: isDeadlineAccess 
        ? "Vous n'avez pas accès à cette échéance" 
        : (errorData.message || "Accès non autorisé"),
      errorName: ErrorType.FORBIDDEN,
      path: errorData.path,
      originalError: error
    };
  }
  
  return {
    status,
    ...errorData,
    message: errorData.message || `Erreur ${status}`,
    originalError: error
  };
};

/**
 * Traite les erreurs de requête (sans réponse du serveur)
 * @param error - Erreur Axios sans réponse
 * @returns Erreur API normalisée
 */
const handleRequestError = (error: AxiosError): ApiError => {

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
};

/**
 * Gère une erreur API et la normalise vers un format standard
 * @param error - L'erreur à traiter (généralement une AxiosError)
 * @returns Erreur API normalisée
 */
export const handleApiError = (error: unknown): ApiError => {

  // Cas d'une erreur Axios avec réponse
  if (error instanceof AxiosError && error.response) {
    return handleResponseError(error);
  }
  
  // Erreur liée à la requête (pas de réponse du serveur)
  if (error instanceof AxiosError && error.request) {
    return handleRequestError(error);
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
 * Table de correspondance entre les codes d'erreur HTTP et les messages utilisateur
 */
const ERROR_MESSAGES: Record<number | string, string | ((error: ApiError) => string)> = {
  400: (error) => `Données invalides: ${error.message}`,
  401: 'Vous devez vous connecter pour accéder à cette ressource',
  403: (error) => error.message || 'Vous n\'avez pas les permissions nécessaires pour cette action',
  404: (error) => `Ressource non trouvée: ${error.message}`,
  409: (error) => `Conflit: ${error.message}`,
  422: (error) => `Validation échouée: ${error.message}`,
  429: 'Trop de requêtes. Veuillez réessayer plus tard.',
  0: (error) => error.errorName === ErrorType.TIMEOUT 
    ? 'La requête a expiré. Veuillez réessayer.' 
    : 'Impossible de contacter le serveur. Vérifiez votre connexion.',
  500: 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.',
  502: 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.',
  503: 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.',
  504: 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.',
  'default': 'Une erreur inconnue s\'est produite'
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

  // Chercher un message correspondant au code d'erreur
  const messageHandler = ERROR_MESSAGES[apiError.status] || ERROR_MESSAGES['default'];
  
  // Appliquer la fonction de formatage si c'est une fonction, sinon utiliser le message directement
  return typeof messageHandler === 'function' 
    ? messageHandler(apiError) 
    : messageHandler;
};

export default handleApiError;