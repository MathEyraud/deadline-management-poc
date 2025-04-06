import api, { handleApiError } from './client';
import { User, LoginCredentials, AuthResponse, CreateUserDto } from '@/types';

/**
 * Service pour gérer l'authentification et les opérations liées aux utilisateurs
 */
export const authService = {
  /**
   * Authentification utilisateur
   * @param {LoginCredentials} credentials - Identifiants de connexion
   * @returns {Promise<AuthResponse>} Réponse d'authentification avec token et informations utilisateur
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Inscription d'un nouvel utilisateur
   * @param {CreateUserDto} userData - Données du nouvel utilisateur
   * @returns {Promise<User>} Utilisateur créé
   */
  register: async (userData: CreateUserDto): Promise<User> => {
    try {
      const response = await api.post<User>('/auth/register', userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Déconnexion de l'utilisateur actuel
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  /**
   * Récupérer les informations de l'utilisateur actuellement connecté
   * @returns {Promise<User>} Informations de l'utilisateur
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} true si l'utilisateur est authentifié
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
  
  /**
   * Récupérer l'utilisateur stocké localement
   * @returns {User|null} Utilisateur stocké ou null
   */
  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      console.error('Erreur lors de la récupération des données utilisateur:', e);
      return null;
    }
  }
};

export default authService;