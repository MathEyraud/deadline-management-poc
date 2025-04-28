/**
 * Service d'API pour les équipes
 * Gère les opérations CRUD sur les équipes
 * @module api/teams
 */
import api from './client';
import handleApiError from './errorHandler';
import { Team, TeamFilters, CreateTeamDto, UpdateTeamDto } from '../../types';

/**
 * Récupère toutes les équipes avec filtres optionnels
 * @param filters - Filtres à appliquer à la requête
 * @returns Liste des équipes correspondant aux filtres
 */
export const getTeams = async (filters?: TeamFilters): Promise<Team[]> => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();
    
    if (filters) {
      // Ajout de chaque filtre défini aux paramètres de requête
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await api.get<Team[]>(`/teams?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère une équipe par son ID
 * @param id - ID de l'équipe à récupérer
 * @returns Détails de l'équipe demandée
 */
export const getTeamById = async (id: string): Promise<Team> => {
  try {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée une nouvelle équipe
 * @param teamData - Données de l'équipe à créer
 * @returns L'équipe créée
 */
export const createTeam = async (teamData: CreateTeamDto): Promise<Team> => {
  try {
    const response = await api.post<Team>('/teams', teamData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour une équipe existante
 * @param id - ID de l'équipe à mettre à jour
 * @param teamData - Données à mettre à jour
 * @returns L'équipe mise à jour
 */
export const updateTeam = async (id: string, teamData: UpdateTeamDto): Promise<Team> => {
  try {
    const response = await api.patch<Team>(`/teams/${id}`, teamData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une équipe
 * @param id - ID de l'équipe à supprimer
 * @returns void
 */
export const deleteTeam = async (id: string): Promise<void> => {
  try {
    await api.delete(`/teams/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Ajoute un membre à une équipe
 * @param teamId - ID de l'équipe
 * @param userId - ID de l'utilisateur à ajouter
 * @returns L'équipe mise à jour
 */
export const addTeamMember = async (teamId: string, userId: string): Promise<Team> => {
  try {
    const response = await api.post<Team>(`/teams/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Ajoute plusieurs membres à une équipe en une seule opération
 * @param teamId - ID de l'équipe
 * @param memberIds - IDs des utilisateurs à ajouter
 * @returns L'équipe mise à jour
 */
export const addTeamMembers = async (teamId: string, memberIds: string[]): Promise<Team> => {
  try {
    const response = await api.post<Team>(`/teams/${teamId}/members`, { memberIds });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Retire un membre d'une équipe
 * @param teamId - ID de l'équipe
 * @param userId - ID de l'utilisateur à retirer
 * @returns L'équipe mise à jour
 */
export const removeTeamMember = async (teamId: string, userId: string): Promise<Team> => {
  try {
    const response = await api.delete<Team>(`/teams/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  addTeamMembers,
  removeTeamMember,
};