/**
 * Client API principal pour communiquer avec le backend
 * Ce fichier configure axios avec les paramètres de base et les intercepteurs
 * @module api/client
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * URL de base de l'API backend
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Timeout par défaut pour les requêtes en millisecondes (60 secondes)
 */
const DEFAULT_TIMEOUT = 60000;

/**
 * Crée et configure une instance axios pour les requêtes API
 * @returns Instance axios configurée
 */
const createAPIClient = (): AxiosInstance => {
  // Création de l'instance avec la configuration de base
  const client = axios.create({
    baseURL: API_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour les requêtes
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Récupération du token depuis le localStorage (côté client uniquement)
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        
        // Ajout du token d'authentification si disponible
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour les réponses
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      // Gestion des erreurs 401 (non authentifié)
      if (error.response?.status === 401) {
        // Si on est côté client, on redirige vers la page de login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirection vers la page de login si on n'y est pas déjà
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Instance API partagée pour l'application
 */
const api = createAPIClient();

export default api;