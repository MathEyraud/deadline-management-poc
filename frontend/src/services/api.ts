/**
 * Service de configuration et d'initialisation du client API
 * @module services/api
 */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// URL de base de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Instance Axios préconfigurée pour communiquer avec l'API backend
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

/**
 * Intercepteur de requêtes pour ajouter le token d'authentification
 */
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Récupération du token depuis le stockage local (si disponible)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Si un token existe, l'ajouter à l'en-tête d'autorisation
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // En cas d'erreur lors de la configuration de la requête
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponses pour gérer les erreurs communes
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Retourner directement la réponse si elle est valide
    return response;
  },
  async (error: AxiosError) => {
    // Si l'erreur est une erreur d'authentification (401)
    if (error.response?.status === 401) {
      // Si nous sommes côté client (navigateur)
      if (typeof window !== 'undefined') {
        // Supprimer le token invalide
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    }
    
    // Propager l'erreur pour qu'elle puisse être gérée spécifiquement par l'appelant
    return Promise.reject(error);
  }
);

export default api;