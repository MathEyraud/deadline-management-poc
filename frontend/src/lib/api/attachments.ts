/**
 * Service d'API pour les pièces jointes
 * Gère les opérations CRUD sur les pièces jointes
 * @module api/attachments
 */
import api from './client';
import handleApiError from './errorHandler';
import { Attachment, AttachmentFilters, UploadResponse } from '../../types';

/**
 * Récupère toutes les pièces jointes avec filtres optionnels
 * @param filters - Filtres à appliquer à la requête
 * @returns Liste des pièces jointes correspondant aux filtres
 */
export const getAttachments = async (filters?: AttachmentFilters): Promise<Attachment[]> => {
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
    
    const response = await api.get<Attachment[]>(`/attachments?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère une pièce jointe par son ID
 * @param id - ID de la pièce jointe à récupérer
 * @returns Détails de la pièce jointe demandée
 */
export const getAttachmentById = async (id: string): Promise<Attachment> => {
  try {
    const response = await api.get<Attachment>(`/attachments/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère les pièces jointes d'une échéance
 * @param deadlineId - ID de l'échéance
 * @returns Liste des pièces jointes de l'échéance
 */
export const getAttachmentsByDeadline = async (deadlineId: string): Promise<Attachment[]> => {
  try {
    const response = await api.get<Attachment[]>(`/attachments/deadline/${deadlineId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Télécharge une pièce jointe
 * @param file - Fichier à télécharger
 * @param deadlineId - ID de l'échéance associée
 * @param classification - Classification du document (optionnelle)
 * @returns Informations sur la pièce jointe créée
 */
export const uploadAttachment = async (
  file: File,
  deadlineId: string,
  classification?: string
): Promise<UploadResponse> => {
  try {
    // Création d'un objet FormData pour l'upload multipart
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deadlineId', deadlineId);
    
    if (classification) {
      formData.append('classification', classification);
    }
    
    const response = await api.post<UploadResponse>('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une pièce jointe
 * @param id - ID de la pièce jointe à supprimer
 * @returns void
 */
export const deleteAttachment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/attachments/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  getAttachments,
  getAttachmentById,
  getAttachmentsByDeadline,
  uploadAttachment,
  deleteAttachment,
};