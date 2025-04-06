import api, { handleApiError } from './client';
import { User, CreateUserDto, UpdateUserDto } from '@/types';

/**
 * Service pour gérer les opérations CRUD sur les utilisateurs
 */
export const usersService = {
  /**
   * Récupérer tous les utilisateurs avec filtres optionnels
   * @param {Object} filters - Filtres optionnels (role, department, isActive, etc.)
   * @returns {Promise<User[]>} Liste des utilisateurs
   */
  getAll: async (filters = {}): Promise<User[]> => {
    try {
      // Transformer les filtres en paramètres de requête
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Gestion des tableaux pour le filtrage multiple
          if (Array.isArray(value)) {
            value.forEach(val => queryParams.append(key, String(val)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const query = queryParams.toString();
      const url = query ? `/users?${query}` : '/users';
      
      const response = await api.get<User[]>(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer un utilisateur par son ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<User>} Détails de l'utilisateur
   */
  getById: async (id: string): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Créer un nouvel utilisateur
   * @param {CreateUserDto} data - Données de l'utilisateur à créer
   * @returns {Promise<User>} Utilisateur créé
   */
  create: async (data: CreateUserDto): Promise<User> => {
    try {
      const response = await api.post<User>('/users', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour un utilisateur existant
   * @param {string} id - ID de l'utilisateur
   * @param {UpdateUserDto} data - Données à mettre à jour
   * @returns {Promise<User>} Utilisateur mis à jour
   */
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    try {
      const response = await api.patch<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Supprimer un utilisateur
   * @param {string} id - ID de l'utilisateur à supprimer
   * @returns {Promise<void>}
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default usersService;