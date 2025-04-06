import api, { handleApiError } from './client';
import { Comment, CreateCommentDto, UpdateCommentDto } from '@/types';

/**
 * Service pour gérer les opérations CRUD sur les commentaires
 */
export const commentsService = {
  /**
   * Récupérer les commentaires d'une échéance
   * @param {string} deadlineId - ID de l'échéance
   * @returns {Promise<Comment[]>} Liste des commentaires
   */
  getByDeadline: async (deadlineId: string): Promise<Comment[]> => {
    try {
      const response = await api.get<Comment[]>(`/comments/deadline/${deadlineId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Créer un nouveau commentaire
   * @param {CreateCommentDto} data - Données du commentaire à créer
   * @returns {Promise<Comment>} Commentaire créé
   */
  create: async (data: CreateCommentDto): Promise<Comment> => {
    try {
      // Vérification de la longueur du commentaire pour respecter les limitations
      if (data.content.length > 2000) {
        data = {
          ...data,
          content: data.content.substring(0, 2000)
        };
        console.warn('Le commentaire a été tronqué à 2000 caractères pour respecter les limitations.');
      }
      
      const response = await api.post<Comment>('/comments', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour un commentaire existant
   * @param {string} id - ID du commentaire
   * @param {UpdateCommentDto} data - Données à mettre à jour
   * @returns {Promise<Comment>} Commentaire mis à jour
   */
  update: async (id: string, data: UpdateCommentDto): Promise<Comment> => {
    try {
      // Vérification de la longueur du commentaire pour respecter les limitations
      if (data.content && data.content.length > 2000) {
        data = {
          ...data,
          content: data.content.substring(0, 2000)
        };
        console.warn('Le commentaire a été tronqué à 2000 caractères pour respecter les limitations.');
      }
      
      const response = await api.patch<Comment>(`/comments/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Supprimer un commentaire
   * @param {string} id - ID du commentaire à supprimer
   * @returns {Promise<void>}
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/comments/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default commentsService;