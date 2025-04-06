import api, { handleApiError } from './client';
import { Project, ProjectFilters, CreateProjectDto, UpdateProjectDto } from '@/types';

/**
 * Service pour gérer les opérations CRUD sur les projets
 */
export const projectsService = {
  /**
   * Récupérer tous les projets avec filtres optionnels
   * @param {ProjectFilters} filters - Filtres à appliquer
   * @returns {Promise<Project[]>} Liste des projets
   */
  getAll: async (filters: ProjectFilters = {}): Promise<Project[]> => {
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
      const url = query ? `/projects?${query}` : '/projects';
      
      const response = await api.get<Project[]>(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer un projet par son ID
   * @param {string} id - ID du projet
   * @returns {Promise<Project>} Détails du projet
   */
  getById: async (id: string): Promise<Project> => {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Créer un nouveau projet
   * @param {CreateProjectDto} data - Données du projet à créer
   * @returns {Promise<Project>} Projet créé
   */
  create: async (data: CreateProjectDto): Promise<Project> => {
    try {
      const response = await api.post<Project>('/projects', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour un projet existant
   * @param {string} id - ID du projet
   * @param {UpdateProjectDto} data - Données à mettre à jour
   * @returns {Promise<Project>} Projet mis à jour
   */
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    try {
      const response = await api.patch<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Supprimer un projet
   * @param {string} id - ID du projet à supprimer
   * @returns {Promise<void>}
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer les projets gérés par un utilisateur spécifique
   * @param {string} managerId - ID du gestionnaire
   * @returns {Promise<Project[]>} Liste des projets du gestionnaire
   */
  getByManager: async (managerId: string): Promise<Project[]> => {
    try {
      const response = await api.get<Project[]>(`/projects/manager/${managerId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Récupérer les projets d'une équipe spécifique
   * @param {string} teamId - ID de l'équipe
   * @returns {Promise<Project[]>} Liste des projets de l'équipe
   */
  getByTeam: async (teamId: string): Promise<Project[]> => {
    try {
      const response = await api.get<Project[]>(`/projects/team/${teamId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default projectsService;