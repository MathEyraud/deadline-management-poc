'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '@/lib/api';
import { Comment, CreateCommentDto, UpdateCommentDto } from '@/types';

/**
 * Hook personnalisé pour gérer les opérations CRUD sur les commentaires
 * @returns {Object} Méthodes et états pour manipuler les commentaires
 */
export const useComments = () => {
  const queryClient = useQueryClient();
  
  /**
   * Récupération des commentaires d'une échéance
   * @param {string} deadlineId - ID de l'échéance
   * @returns {Object} Données, états de chargement et erreurs
   */
  const useDeadlineComments = (deadlineId: string | null) => {
    return useQuery({
      queryKey: ['comments', 'deadline', deadlineId],
      queryFn: () => commentsService.getByDeadline(deadlineId as string),
      enabled: !!deadlineId // Ne déclenche la requête que si deadlineId est fourni
    });
  };
  
  // Création d'un commentaire
  const createMutation = useMutation({
    mutationFn: (comment: CreateCommentDto) => commentsService.create(comment),
    onSuccess: (_, variables) => {
      // Invalider le cache pour les commentaires de cette échéance
      queryClient.invalidateQueries({ 
        queryKey: ['comments', 'deadline', variables.deadlineId] 
      });
    }
  });
  
  // Mise à jour d'un commentaire
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDto }) => 
      commentsService.update(id, data),
    onSuccess: (data) => {
      // L'API renvoie le commentaire mis à jour avec son deadlineId
      if (data && 'deadlineId' in data) {
        queryClient.invalidateQueries({ 
          queryKey: ['comments', 'deadline', data.deadlineId] 
        });
      }
    }
  });
  
  // Suppression d'un commentaire
  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsService.delete(id),
    onSuccess: (_, variables, context) => {
      // Le contexte doit contenir le deadlineId pour invalider les requêtes appropriées
      if (context && typeof context === 'object' && 'deadlineId' in context) {
        queryClient.invalidateQueries({ 
          queryKey: ['comments', 'deadline', context.deadlineId] 
        });
      }
    }
  });

  /**
   * Créer un nouveau commentaire
   * @param {CreateCommentDto} comment - Données du commentaire à créer
   * @returns {Promise<Comment>} Commentaire créé
   */
  const createComment = async (comment: CreateCommentDto): Promise<Comment> => {
    return createMutation.mutateAsync(comment);
  };

  /**
   * Mettre à jour un commentaire existant
   * @param {string} id - ID du commentaire
   * @param {UpdateCommentDto} data - Données à mettre à jour
   * @returns {Promise<Comment>} Commentaire mis à jour
   */
  const updateComment = async (id: string, data: UpdateCommentDto): Promise<Comment> => {
    return updateMutation.mutateAsync({ id, data });
  };

  /**
   * Supprimer un commentaire
   * @param {string} id - ID du commentaire
   * @param {string} deadlineId - ID de l'échéance associée (pour invalidation du cache)
   * @returns {Promise<void>}
   */
  const deleteComment = async (id: string, deadlineId: string): Promise<void> => {
    return deleteMutation.mutateAsync(id, { context: { deadlineId } });
  };

  return {
    useDeadlineComments,
    createComment,
    updateComment,
    deleteComment,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};