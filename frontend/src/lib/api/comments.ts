/**
 * Service d'API pour les commentaires
 * Gère les opérations CRUD sur les commentaires
 * @module api/comments
 */
import api from './client';
import handleApiError from './errorHandler';
import { Comment, CommentFilters, CreateCommentDto, UpdateCommentDto } from '../../types';

/**
 * Récupère tous les commentaires avec filtres optionnels
 * @param filters - Filtres à appliquer à la requête
 * @returns Liste des commentaires correspondant aux filtres
 */
export const getComments = async (filters?: CommentFilters): Promise<Comment[]> => {
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
    
    const response = await api.get<Comment[]>(`/comments?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère un commentaire par son ID
 * @param id - ID du commentaire à récupérer
 * @returns Détails du commentaire demandé
 */
export const getCommentById = async (id: string): Promise<Comment> => {
  try {
    const response = await api.get<Comment>(`/comments/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les commentaires d'une échéance
 * @param deadlineId - ID de l'échéance
 * @returns Liste des commentaires de l'échéance
 */
export const getCommentsByDeadline = async (deadlineId: string): Promise<Comment[]> => {
  try {
    const response = await api.get<Comment[]>(`/comments/deadline/${deadlineId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée un nouveau commentaire
 * @param commentData - Données du commentaire à créer
 * @returns Le commentaire créé
 */
export const createComment = async (commentData: CreateCommentDto): Promise<Comment> => {
  try {
    const response = await api.post<Comment>('/comments', commentData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour un commentaire existant
 * @param id - ID du commentaire à mettre à jour
 * @param commentData - Données à mettre à jour
 * @returns Le commentaire mis à jour
 */
export const updateComment = async (id: string, commentData: UpdateCommentDto): Promise<Comment> => {
  try {
    const response = await api.patch<Comment>(`/comments/${id}`, commentData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime un commentaire
 * @param id - ID du commentaire à supprimer
 * @returns void
 */
export const deleteComment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/comments/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getComments,
  getCommentById,
  getCommentsByDeadline,
  createComment,
  updateComment,
  deleteComment,
};