/**
 * Hook personnalisé pour gérer les pièces jointes
 * @module hooks/useAttachments
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsService } from '../lib/api';
import { Attachment, AttachmentFilters, UploadResponse } from '../types';

/**
 * Clés de cache pour React Query
 */
export const attachmentsKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentsKeys.all, 'list'] as const,
  list: (filters: AttachmentFilters) => [...attachmentsKeys.lists(), filters] as const,
  details: () => [...attachmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...attachmentsKeys.details(), id] as const,
  byDeadline: (deadlineId: string) => [...attachmentsKeys.lists(), 'deadline', deadlineId] as const,
  byUploader: (uploaderId: string) => [...attachmentsKeys.lists(), 'uploader', uploaderId] as const,
};

/**
 * Hook pour récupérer la liste des pièces jointes avec filtres
 * @param filters - Filtres à appliquer
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useAttachmentsList(filters?: AttachmentFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: attachmentsKeys.list(filters || {}),
    queryFn: () => attachmentsService.getAttachments(filters),
    enabled,
  });
}

/**
 * Hook pour récupérer une pièce jointe par son ID
 * @param id - ID de la pièce jointe
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useAttachment(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: attachmentsKeys.detail(id),
    queryFn: () => attachmentsService.getAttachmentById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Hook pour récupérer les pièces jointes d'une échéance
 * @param deadlineId - ID de l'échéance
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useAttachmentsByDeadline(deadlineId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: attachmentsKeys.byDeadline(deadlineId),
    queryFn: () => attachmentsService.getAttachmentsByDeadline(deadlineId),
    enabled: !!deadlineId && enabled,
  });
}

/**
 * Hook pour télécharger et supprimer des pièces jointes
 * @returns Fonctions pour la gestion des pièces jointes
 */
export function useAttachmentMutations() {
  const queryClient = useQueryClient();
  
  // Mutation pour télécharger une pièce jointe
  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ 
      file, 
      deadlineId, 
      classification 
    }: { 
      file: File; 
      deadlineId: string; 
      classification?: string;
    }) => attachmentsService.uploadAttachment(file, deadlineId, classification),
    onSuccess: (response) => {
      // Invalide la liste des pièces jointes pour l'échéance concernée
      queryClient.invalidateQueries({ 
        queryKey: attachmentsKeys.byDeadline(response.attachment.deadlineId) 
      });
    },
  });
  
  // Mutation pour supprimer une pièce jointe
  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: string) => attachmentsService.deleteAttachment(id),
    onSuccess: (_, id) => {
      // Récupère la pièce jointe du cache avant de la supprimer
      const attachment = queryClient.getQueryData<Attachment>(attachmentsKeys.detail(id));
      
      // Supprime la pièce jointe du cache
      queryClient.removeQueries({ queryKey: attachmentsKeys.detail(id) });
      
      // Si on a la pièce jointe, on invalide la liste des pièces jointes pour l'échéance concernée
      if (attachment) {
        queryClient.invalidateQueries({ 
          queryKey: attachmentsKeys.byDeadline(attachment.deadlineId) 
        });
      }
    },
  });
  
  return {
    uploadAttachment: useCallback(
      (file: File, deadlineId: string, classification?: string) => 
        uploadAttachmentMutation.mutateAsync({ file, deadlineId, classification }),
      [uploadAttachmentMutation]
    ),
    deleteAttachment: useCallback(
      (id: string) => deleteAttachmentMutation.mutateAsync(id),
      [deleteAttachmentMutation]
    ),
    isUploading: uploadAttachmentMutation.isPending,
    isDeleting: deleteAttachmentMutation.isPending,
    uploadError: uploadAttachmentMutation.error,
    deleteError: deleteAttachmentMutation.error,
  };
}

/**
 * Interface pour les résultats du hook de gestion du téléchargement de fichiers
 */
export interface UseFileUploadResult {
  /** Fonction pour sélectionner et télécharger un fichier */
  selectAndUploadFile: (deadlineId: string, classification?: string) => void;
  
  /** Fonction pour télécharger un fichier */
  uploadFile: (file: File, deadlineId: string, classification?: string) => Promise<UploadResponse>;
  
  /** Indique si un téléchargement est en cours */
  isUploading: boolean;
  
  /** Erreur éventuelle lors du téléchargement */
  error: Error | null;
}

/**
 * Hook pour gérer le téléchargement de fichiers avec une interface utilisateur simplifiée
 * @returns Fonctions et états pour le téléchargement de fichiers
 */
export function useFileUpload(): UseFileUploadResult {
  const { uploadAttachment, isUploading, uploadError } = useAttachmentMutations();
  
  /**
   * Fonction pour sélectionner et télécharger un fichier
   * @param deadlineId - ID de l'échéance associée
   * @param classification - Classification du document (optionnelle)
   */
  const selectAndUploadFile = useCallback((deadlineId: string, classification?: string) => {
    // Crée un élément input de type file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    // Définit la fonction à exécuter lorsqu'un fichier est sélectionné
    fileInput.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        try {
          await uploadAttachment(file, deadlineId, classification);
        } catch (error) {
          console.error('Erreur lors du téléchargement du fichier:', error);
        }
      }
    };
    
    // Simule un clic sur l'input pour ouvrir la boîte de dialogue de sélection de fichier
    fileInput.click();
  }, [uploadAttachment]);
  
  return {
    selectAndUploadFile,
    uploadFile: uploadAttachment,
    isUploading,
    error: uploadError,
  };
}