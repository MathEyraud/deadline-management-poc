/**
 * Hook personnalisé pour gérer les commentaires
 * @module hooks/useComments
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../lib/api';
import { Comment, CommentFilters, CreateCommentDto, UpdateCommentDto } from '../types';

/**
 * Clés de cache pour React Query
 */
export const commentsKeys = {
  all: ['comments'] as const,
  lists: () => [...commentsKeys.all, 'list'] as const,
  list: (filters: CommentFilters) => [...commentsKeys.lists(), filters] as const,
  details: () => [...commentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...commentsKeys.details(), id] as const,
  byDeadline: (deadlineId: string) => [...commentsKeys.lists(), 'deadline', deadlineId] as const,
};

/**
 * Hook pour récupérer les commentaires d'une échéance
 * @param deadlineId - ID de l'échéance
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useCommentsByDeadline(deadlineId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: commentsKeys.byDeadline(deadlineId),
    queryFn: () => commentsService.getCommentsByDeadline(deadlineId),
    enabled: !!deadlineId && enabled,
  });
}

/**
 * Hook pour la création, la mise à jour et la suppression de commentaires
 * @returns Fonctions pour la gestion des commentaires
 */
export function useCommentMutations() {
  const queryClient = useQueryClient();
  
  // Mutation pour créer un commentaire
  const createCommentMutation = useMutation({
    mutationFn: (newComment: CreateCommentDto) => commentsService.createComment(newComment),
    onSuccess: (createdComment) => {
      // Invalide la liste des commentaires pour l'échéance concernée
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.byDeadline(createdComment.deadlineId) 
      });
    },
  });
  
  // Mutation pour mettre à jour un commentaire
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDto }) => 
      commentsService.updateComment(id, data),
    onSuccess: (updatedComment) => {
      // Mise à jour du cache pour le commentaire modifié
      queryClient.setQueryData(
        commentsKeys.detail(updatedComment.id),
        updatedComment
      );
      // Invalide la liste des commentaires pour l'échéance concernée
      queryClient.invalidateQueries({ 
        queryKey: commentsKeys.byDeadline(updatedComment.deadlineId) 
      });
    },
  });
  
  // Mutation pour supprimer un commentaire
  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => commentsService.deleteComment(id),
    onSuccess: (_, id) => {
      // Récupère le commentaire du cache avant de le supprimer
      const comment = queryClient.getQueryData<Comment>(commentsKeys.detail(id));
      
      // Supprime le commentaire du cache
      queryClient.removeQueries({ queryKey: commentsKeys.detail(id) });
      
      // Si on a le commentaire, on invalide la liste des commentaires pour l'échéance concernée
      if (comment) {
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.byDeadline(comment.deadlineId) 
        });
      }
    },
  });
  
  return {
    createComment: useCallback(
      (newComment: CreateCommentDto) => createCommentMutation.mutateAsync(newComment),
      [createCommentMutation]
    ),
    updateComment: useCallback(
      (id: string, data: UpdateCommentDto) => updateCommentMutation.mutateAsync({ id, data }),
      [updateCommentMutation]
    ),
    deleteComment: useCallback(
      (id: string) => deleteCommentMutation.mutateAsync(id),
      [deleteCommentMutation]
    ),
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    createError: createCommentMutation.error,
    updateError: updateCommentMutation.error,
    deleteError: deleteCommentMutation.error,
  };
}