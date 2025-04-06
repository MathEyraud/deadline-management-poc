'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsService } from '@/lib/api';
import { Attachment, UploadResponse } from '@/types';

/**
 * Hook personnalisé pour gérer les opérations sur les pièces jointes
 * @returns {Object} Méthodes et états pour manipuler les pièces jointes
 */
export const useAttachments = () => {
  const queryClient = useQueryClient();
  
  /**
   * Récupération des pièces jointes d'une échéance
   * @param {string} deadlineId - ID de l'échéance
   * @returns {Object} Données, états de chargement et erreurs
   */
  const useDeadlineAttachments = (deadlineId: string | null) => {
    return useQuery({
      queryKey: ['attachments', 'deadline', deadlineId],
      queryFn: () => attachmentsService.getByDeadline(deadlineId as string),
      enabled: !!deadlineId // Ne déclenche la requête que si deadlineId est fourni
    });
  };
  
  // Upload d'une pièce jointe
  const uploadMutation = useMutation({
    mutationFn: ({ 
      file, 
      deadlineId, 
      classification 
    }: { 
      file: File; 
      deadlineId: string; 
      classification?: string 
    }) => attachmentsService.upload(file, deadlineId, classification),
    onSuccess: (_, variables) => {
      // Invalider le cache pour les pièces jointes de cette échéance
      queryClient.invalidateQueries({ 
        queryKey: ['attachments', 'deadline', variables.deadlineId] 
      });
    }
  });
  
  // Suppression d'une pièce jointe
  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentsService.delete(id),
    onSuccess: (_, __, context) => {
      // Le contexte doit contenir le deadlineId pour invalider les requêtes appropriées
      if (context && typeof context === 'object' && 'deadlineId' in context) {
        queryClient.invalidateQueries({ 
          queryKey: ['attachments', 'deadline', context.deadlineId] 
        });
      }
    }
  });

  /**
   * Uploader un fichier en tant que pièce jointe
   * @param {File} file - Fichier à charger
   * @param {string} deadlineId - ID de l'échéance associée
   * @param {string} [classification] - Classification optionnelle du document
   * @returns {Promise<UploadResponse>} Informations sur la pièce jointe créée
   */
  const uploadAttachment = async (
    file: File, 
    deadlineId: string,
    classification?: string
  ): Promise<UploadResponse> => {
    return uploadMutation.mutateAsync({ file, deadlineId, classification });
  };

  /**
   * Supprimer une pièce jointe
   * @param {string} id - ID de la pièce jointe
   * @param {string} deadlineId - ID de l'échéance associée (pour invalidation du cache)
   * @returns {Promise<void>}
   */
  const deleteAttachment = async (id: string, deadlineId: string): Promise<void> => {
    return deleteMutation.mutateAsync(id, { context: { deadlineId } });
  };

  return {
    useDeadlineAttachments,
    uploadAttachment,
    deleteAttachment,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadError: uploadMutation.error,
    deleteError: deleteMutation.error
  };
};