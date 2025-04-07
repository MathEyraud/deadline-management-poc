/**
 * Service d'API pour les utilisateurs
 * Gère les opérations CRUD sur les utilisateurs
 * @module api/users
 */
import api from './client';
import handleApiError from './errorHandler';
import { User, UserFilters, CreateUserDto, UpdateUserDto } from '../../types';

/**
 * Récupère tous les utilisateurs avec filtres optionnels
 * @param filters - Filtres à appliquer à la requête
 * @returns Liste des utilisateurs correspondant aux filtres
 */
export const getUsers = async (filters?: UserFilters): Promise<User[]> => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();
    
    if (filters) {
      // Ajout de chaque filtre défini aux paramètres de requête
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Gestion des tableaux
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const response = await api.get<User[]>(`/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère un utilisateur par son ID
 * @param id - ID de l'utilisateur à récupérer
 * @returns Détails de l'utilisateur demandé
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée un nouvel utilisateur
 * @param userData - Données de l'utilisateur à créer
 * @returns L'utilisateur créé
 */
export const createUser = async (userData: CreateUserDto): Promise<User> => {
  try {
    const response = await api.post<User>('/users', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour un utilisateur existant
 * @param id - ID de l'utilisateur à mettre à jour
 * @param userData - Données à mettre à jour
 * @returns L'utilisateur mis à jour
 */
export const updateUser = async (id: string, userData: UpdateUserDto): Promise<User> => {
  try {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime un utilisateur
 * @param id - ID de l'utilisateur à supprimer
 * @returns void
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};