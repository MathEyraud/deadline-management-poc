import api, { handleApiError } from './client';
import { Deadline, DeadlineFilters, CreateDeadlineDto, UpdateDeadlineDto } from '@/types';

/**
 * Service pour gérer les opérations CRUD sur les échéances
 */
export const deadlinesService = {
  /**
   * Récupérer toutes les échéances avec filtres optionnels
   * @param {DeadlineFilters} filters - Filtres à appliquer
   * @returns {Promise<Deadline[]>} Liste des échéances
   */
  getAll: async (filters: DeadlineFilters = {}): Promise<Deadline[]> => {
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
      const url = query ? `/deadlines?${query}` : '/deadlines';
      
      const response = await api.get<Deadline[]>(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer une échéance par son ID
   * @param {string} id - ID de l'échéance
   * @returns {Promise<Deadline>} Détails de l'échéance
   */
  getById: async (id: string): Promise<Deadline> => {
    try {
      const response = await api.get<Deadline>(`/deadlines/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Créer une nouvelle échéance
   * @param {CreateDeadlineDto} data - Données de l'échéance à créer
   * @returns {Promise<Deadline>} Échéance créée
   */
  create: async (data: CreateDeadlineDto): Promise<Deadline> => {
    try {
      const response = await api.post<Deadline>('/deadlines', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour une échéance existante
   * @param {string} id - ID de l'échéance
   * @param {UpdateDeadlineDto} data - Données à mettre à jour
   * @returns {Promise<Deadline>} Échéance mise à jour
   */
  update: async (id: string, data: UpdateDeadlineDto): Promise<Deadline> => {
    try {
      const response = await api.patch<Deadline>(`/deadlines/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Supprimer une échéance
   * @param {string} id - ID de l'échéance à supprimer
   * @returns {Promise<void>}
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/deadlines/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer les échéances d'un projet spécifique
   * @param {string} projectId - ID du projet
   * @returns {Promise<Deadline[]>} Liste des échéances du projet
   */
  getByProject: async (projectId: string): Promise<Deadline[]> => {
    try {
      const response = await api.get<Deadline[]>(`/deadlines/project/${projectId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer les échéances d'un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Deadline[]>} Liste des échéances de l'utilisateur
   */
  getByUser: async (userId: string): Promise<Deadline[]> => {
    try {
      const response = await api.get<Deadline[]>(`/deadlines/user/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default deadlinesService;