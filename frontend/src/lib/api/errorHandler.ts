import { useNotifications } from '@/app/providers';

/**
 * Type d'erreur API qui comprend les détails de l'erreur backend
 */
export interface ApiError extends Error {
  response?: {
    status: number;
    data: {
      statusCode: number;
      message: string;
      errors?: Record<string, string[]>;
      path?: string;
      method?: string;
      timestamp?: string;
      errorName?: string;
    };
  };
  request?: any;
}

/**
 * Fonction utilitaire pour extraire un message d'erreur convivial
 * @param {unknown} error - L'erreur à traiter
 * @returns {string} Message d'erreur convivial
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Une erreur inconnue est survenue';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    // Erreur API avec réponse du serveur
    if (apiError.response) {
      const { status, data } = apiError.response;
      
      // Erreur de validation avec plusieurs champs
      if (data.errors && Object.keys(data.errors).length > 0) {
        const firstField = Object.keys(data.errors)[0];
        const firstError = data.errors[firstField][0];
        return `${firstField}: ${firstError}`;
      }
      
      // Erreurs spécifiques par code HTTP
      switch (status) {
        case 400: return data.message || 'Requête invalide';
        case 401: return 'Vous devez être connecté pour accéder à cette ressource';
        case 403: return 'Vous n\'avez pas les permissions nécessaires';
        case 404: return data.message || 'Ressource non trouvée';
        case 409: return data.message || 'Conflit avec l\'état actuel de la ressource';
        case 422: return data.message || 'Les données fournies ne peuvent pas être traitées';
        case 429: return 'Trop de requêtes, veuillez réessayer plus tard';
        case 500: return 'Erreur interne du serveur, veuillez réessayer plus tard';
        default: return data.message || `Erreur ${status}`;
      }
    }
    
    // Erreur de réseau (pas de réponse du serveur)
    if (apiError.request) {
      return 'Le serveur ne répond pas. Veuillez vérifier votre connexion et réessayer.';
    }
    
    // Erreur JavaScript standard
    return apiError.message;
  }
  
  // Si l'erreur n'est pas une instance d'Error (objet, tableau, etc.)
  return JSON.stringify(error);
};

/**
 * Hook pour gérer les erreurs API et afficher des notifications
 * @returns {Object} Fonctions pour gérer les erreurs
 */
export const useApiErrorHandler = () => {
  const { showNotification } = useNotifications();
  
  /**
   * Gère une erreur API et affiche une notification
   * @param {unknown} error - L'erreur à traiter
   * @param {string} [fallbackMessage] - Message par défaut si l'erreur n'est pas identifiable
   */
  const handleError = (error: unknown, fallbackMessage = 'Une erreur est survenue') => {
    const message = getErrorMessage(error) || fallbackMessage;
    showNotification(message, 'error');
    
    // Logger l'erreur pour le débogage
    console.error('API Error:', error);
  };
  
  return {
    handleError,
    getErrorMessage
  };
};