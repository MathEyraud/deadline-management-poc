/**
 * Gestionnaire d'erreurs centralisé pour les requêtes API
 * @module api/errorHandler
 */
import { AxiosError } from 'axios';

/**
 * Interface pour les erreurs API structurées
 */
export interface ApiError {
  status: number;
  message: string;
  path?: string;
  timestamp?: string;
  errorName?: string;
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
        errorName: data.errorName
      };
    }
    
    // Si le backend a renvoyé un message simple
    return {
      status,
      message: typeof data === 'string' ? data : `Erreur ${status}`,
    };
  }
  
  // Erreur liée à la requête (pas de réponse du serveur)
  if (error instanceof AxiosError && error.request) {
    return {
      status: 0,
      message: 'Le serveur ne répond pas. Veuillez vérifier votre connexion ou réessayer plus tard.',
    };
  }
  
  // Autres types d'erreurs
  return {
    status: 500,
    message: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite',
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
    case 0:
      return 'Impossible de contacter le serveur';
    default:
      return apiError.message;
  }
};

export default handleApiError;