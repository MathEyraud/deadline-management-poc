/**
 * Service d'API pour les projets
 * Gère les opérations CRUD sur les projets
 * @module api/projects
 */
import api from './client';
import handleApiError from './errorHandler';
import { Project, ProjectFilters, CreateProjectDto, UpdateProjectDto } from '../../types';

/**
 * Récupère tous les projets avec filtres optionnels
 * @param filters - Filtres à appliquer à la requête
 * @returns Liste des projets correspondant aux filtres
 */
export const getProjects = async (filters?: ProjectFilters): Promise<Project[]> => {
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
    
    const response = await api.get<Project[]>(`/projects?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère un projet par son ID
 * @param id - ID du projet à récupérer
 * @returns Détails du projet demandé
 */
export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée un nouveau projet
 * @param projectData - Données du projet à créer
 * @returns Le projet créé
 */
export const createProject = async (projectData: CreateProjectDto): Promise<Project> => {
  try {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour un projet existant
 * @param id - ID du projet à mettre à jour
 * @param projectData - Données à mettre à jour
 * @returns Le projet mis à jour
 */
export const updateProject = async (id: string, projectData: UpdateProjectDto): Promise<Project> => {
  try {
    const response = await api.patch<Project>(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime un projet
 * @param id - ID du projet à supprimer
 * @returns void
 */
export const deleteProject = async (id: string): Promise<void> => {
  try {
    await api.delete(`/projects/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les projets gérés par un utilisateur
 * @param managerId - ID du gestionnaire
 * @returns Liste des projets du gestionnaire
 */
export const getProjectsByManager = async (managerId: string): Promise<Project[]> => {
  try {
    const response = await api.get<Project[]>(`/projects/manager/${managerId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les projets associés à une équipe
 * @param teamId - ID de l'équipe
 * @returns Liste des projets de l'équipe
 */
export const getProjectsByTeam = async (teamId: string): Promise<Project[]> => {
  try {
    const response = await api.get<Project[]>(`/projects/team/${teamId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByManager,
  getProjectsByTeam,
};