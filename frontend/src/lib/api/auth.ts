/**
 * Service d'API pour l'authentification
 * Gère la connexion et l'enregistrement des utilisateurs
 * @module api/auth
 */
import api from './client';
import handleApiError from './errorHandler';
import { User } from '../../types';

/**
 * Interface pour les informations de connexion
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface pour les données d'enregistrement
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department?: string;
  role?: string;
}

/**
 * Interface pour la réponse d'authentification
 */
export interface AuthResponse {
  access_token: string;
  user: User;
}

/**
 * Connecte un utilisateur et récupère son token JWT
 * @param credentials - Les identifiants de connexion
 * @returns Réponse contenant le token et les infos utilisateur
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Stockage du token et des informations utilisateur
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Enregistre un nouvel utilisateur
 * @param userData - Les données du nouvel utilisateur
 * @returns L'utilisateur créé
 */
export const register = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Déconnecte l'utilisateur (supprime le token et les informations utilisateur)
 */
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Vérifie si l'utilisateur est actuellement authentifié
 * @returns true si l'utilisateur est authentifié
 */
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token');
  }
  return false;
};

/**
 * Récupère l'utilisateur actuellement connecté
 * @returns L'utilisateur connecté ou null
 */
export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
  return null;
};

export default {
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser
};