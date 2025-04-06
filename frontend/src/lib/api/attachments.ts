import api, { handleApiError } from './client';
import { Attachment, UploadResponse } from '@/types';

/**
 * Service pour gérer les opérations sur les pièces jointes
 */
export const attachmentsService = {
  /**
   * Récupérer les pièces jointes d'une échéance
   * @param {string} deadlineId - ID de l'échéance
   * @returns {Promise<Attachment[]>} Liste des pièces jointes
   */
  getByDeadline: async (deadlineId: string): Promise<Attachment[]> => {
    try {
      const response = await api.get<Attachment[]>(`/attachments/deadline/${deadlineId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Charger une nouvelle pièce jointe
   * @param {File} file - Fichier à charger
   * @param {string} deadlineId - ID de l'échéance associée
   * @param {string} classification - Classification optionnelle
   * @returns {Promise<UploadResponse>} Informations sur la pièce jointe créée
   */
  upload: async (file: File, deadlineId: string, classification?: string): Promise<UploadResponse> => {
    try {
      // Vérifier la taille du fichier (max 50 Mo)
      const maxSize = 50 * 1024 * 1024; // 50 Mo en octets
      if (file.size > maxSize) {
        throw new Error(`La taille du fichier (${(file.size / (1024 * 1024)).toFixed(2)} Mo) dépasse la limite de 50 Mo.`);
      }
      
      // Créer un FormData pour l'upload multipart
      const formData = new FormData();
      formData.append('file', file);
      formData.append('deadlineId', deadlineId);
      
      if (classification) {
        formData.append('classification', classification);
      }
      
      // Configurer les en-têtes spécifiques pour l'upload de fichier
      const response = await api.post<UploadResponse>('/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Supprimer une pièce jointe
   * @param {string} id - ID de la pièce jointe à supprimer
   * @returns {Promise<void>}
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/attachments/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default attachmentsService;