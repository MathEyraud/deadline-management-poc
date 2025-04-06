import api, { handleApiError } from './client';
import { Team, CreateTeamDto, UpdateTeamDto } from '@/types';

/**
 * Service pour gérer les opérations CRUD sur les équipes
 */
export const teamsService = {
  /**
   * Récupérer toutes les équipes avec filtres optionnels
   * @param {Object} filters - Filtres optionnels (leaderId, department, etc.)
   * @returns {Promise<Team[]>} Liste des équipes
   */
  getAll: async (filters = {}): Promise<Team[]> => {
    try {
      // Transformer les filtres en paramètres de requête
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const query = queryParams.toString();
      const url = query ? `/teams?${query}` : '/teams';
      
      const response = await api.get<Team[]>(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer une équipe par son ID
   * @param {string} id - ID de l'équipe
   * @returns {Promise<Team>} Détails de l'équipe
   */
  getById: async (id: string): Promise<Team> => {
    try {
      const response = await api.get<Team>(`/teams/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Créer une nouvelle équipe
   * @param {CreateTeamDto} data - Données de l'équipe à créer
   * @returns {Promise<Team>} Équipe créée
   */
  create: async (data: CreateTeamDto): Promise<Team> => {
    try {
      const response = await api.post<Team>('/teams', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour une équipe existante
   * @param {string} id - ID de l'équipe
   * @param {UpdateTeamDto} data - Données à mettre à jour
   * @returns {Promise<Team>} Équipe mise à jour
   */
  update: async (id: string, data: UpdateTeamDto): Promise<Team> => {
    try {
      const response = await api.patch<Team>(`/teams/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Supprimer une équipe
   * @param {string} id - ID de l'équipe à supprimer
   * @returns {Promise<void>}
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/teams/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Ajouter un membre à une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {string} userId - ID de l'utilisateur à ajouter
   * @returns {Promise<Team>} Équipe mise à jour
   */
  addMember: async (teamId: string, userId: string): Promise<Team> => {
    try {
      const response = await api.post<Team>(`/teams/${teamId}/members/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Retirer un membre d'une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {string} userId - ID de l'utilisateur à retirer
   * @returns {Promise<Team>} Équipe mise à jour
   */
  removeMember: async (teamId: string, userId: string): Promise<Team> => {
    try {
      const response = await api.delete<Team>(`/teams/${teamId}/members/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default teamsService;