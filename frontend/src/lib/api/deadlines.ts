/**
 * Service d'API pour les échéances
 * Gère les opérations CRUD sur les échéances
 * @module api/deadlines
 */
import api from './client';
import handleApiError from './errorHandler';
import { Deadline, DeadlineFilters, CreateDeadlineDto, UpdateDeadlineDto, DeadlineStats } from '../../types';

/**
 * Récupère toutes les échéances avec filtres optionnels
 * @param filters - Filtres à appliquer à la requête
 * @returns Liste des échéances correspondant aux filtres
 */
export const getDeadlines = async (filters?: DeadlineFilters): Promise<Deadline[]> => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();
    
    if (filters) {
      // Ajout de chaque filtre défini aux paramètres de requête
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Gestion des tableaux (comme multiple statut)
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const response = await api.get<Deadline[]>(`/deadlines?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère une échéance par son ID
 * @param id - ID de l'échéance à récupérer
 * @returns Détails de l'échéance demandée
 */
export const getDeadlineById = async (id: string): Promise<Deadline> => {
  try {
    const response = await api.get<Deadline>(`/deadlines/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée une nouvelle échéance
 * @param deadlineData - Données de l'échéance à créer
 * @returns L'échéance créée
 */
export const createDeadline = async (deadlineData: CreateDeadlineDto): Promise<Deadline> => {
  try {
    const response = await api.post<Deadline>('/deadlines', deadlineData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour une échéance existante
 * @param id - ID de l'échéance à mettre à jour
 * @param deadlineData - Données à mettre à jour
 * @returns L'échéance mise à jour
 */
export const updateDeadline = async (id: string, deadlineData: UpdateDeadlineDto): Promise<Deadline> => {
  try {
    const response = await api.patch<Deadline>(`/deadlines/${id}`, deadlineData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une échéance
 * @param id - ID de l'échéance à supprimer
 * @returns void
 */
export const deleteDeadline = async (id: string): Promise<void> => {
  try {
    await api.delete(`/deadlines/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les échéances associées à un projet
 * @param projectId - ID du projet
 * @returns Liste des échéances du projet
 */
export const getDeadlinesByProject = async (projectId: string): Promise<Deadline[]> => {
  try {
    const response = await api.get<Deadline[]>(`/deadlines/project/${projectId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les échéances créées par un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Liste des échéances de l'utilisateur
 */
export const getDeadlinesByUser = async (userId: string): Promise<Deadline[]> => {
  try {
    const response = await api.get<Deadline[]>(`/deadlines/user/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère des statistiques sur les échéances
 * Utilisé pour le tableau de bord
 * @returns Statistiques sur les échéances
 */
export const getDeadlineStats = async (): Promise<DeadlineStats> => {
  try {
    const response = await api.get<DeadlineStats>('/deadlines/stats');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getDeadlines,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  deleteDeadline,
  getDeadlinesByProject,
  getDeadlinesByUser,
  getDeadlineStats,
};