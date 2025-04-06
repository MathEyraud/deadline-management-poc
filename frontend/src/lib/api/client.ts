import axios from 'axios';

/**
 * Client Axios configuré pour communiquer avec l'API backend
 * Inclut la gestion du token d'authentification et des erreurs
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000, // 10 secondes
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    // Ne pas exécuter côté serveur (SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs selon le format standardisé du backend
    if (error.response) {
      const { status, data } = error.response;
      
      // Si erreur 401 (non authentifié), rediriger vers la page de connexion
      if (status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Ne pas rediriger automatiquement pendant les tests ou si on est déjà sur la page de login
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
      
      // Loguer l'erreur avec ses détails
      console.error(`Erreur API (${status}):`, data.message || data);
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('Pas de réponse du serveur:', error.request);
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Fonction utilitaire pour gérer les erreurs API de façon centralisée
 * @param {Error} error - L'erreur capturée
 */
export const handleApiError = (error: any) => {
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Token expiré ou non authentifié - déjà géré par l'intercepteur
        break;
      case 403:
        // Non autorisé
        console.error('Accès non autorisé:', data.message);
        break;
      case 404:
        // Ressource non trouvée
        console.error('Ressource non trouvée:', data.message);
        break;
      default:
        // Autres erreurs
        console.error(`Erreur ${status}:`, data.message);
    }
  } else if (error.request) {
    // La requête a été faite mais pas de réponse
    console.error('Pas de réponse du serveur');
  } else {
    // Erreur lors de la configuration de la requête
    console.error('Erreur de requête:', error.message);
  }
};

export default api;