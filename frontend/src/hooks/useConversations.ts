/**
 * Hook personnalisé pour gérer les conversations avec l'IA
 * @module hooks/useConversations
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../lib/api';
import { Conversation, Message } from '../types';
import { useNotifications } from '@/app/providers';

/**
 * Clés de cache pour React Query
 */
export const conversationsKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationsKeys.all, 'list'] as const,
  list: (filters: { activeOnly: boolean }) => [...conversationsKeys.lists(), filters] as const,
  details: () => [...conversationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationsKeys.details(), id] as const,
  messages: (id: string) => [...conversationsKeys.detail(id), 'messages'] as const,
};

/**
 * Hook pour récupérer la liste des conversations
 * @param activeOnly - Si true, ne récupère que les conversations actives
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useConversationsList(activeOnly: boolean = true, enabled: boolean = true) {
  return useQuery({
    queryKey: conversationsKeys.list({ activeOnly }),
    queryFn: () => aiService.getConversations(activeOnly),
    enabled,
  });
}

/**
 * Hook pour récupérer une conversation par son ID
 * @param id - ID de la conversation
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useConversation(id: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: conversationsKeys.detail(id || ''),
    queryFn: () => aiService.getConversationById(id || ''),
    enabled: !!id && enabled,
  });
}

/**
 * Hook pour récupérer les messages d'une conversation
 * @param id - ID de la conversation
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useConversationMessages(id: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: conversationsKeys.messages(id || ''),
    queryFn: () => aiService.getConversationMessages(id || ''),
    enabled: !!id && enabled,
  });
}

/**
 * Hook pour les opérations de mutation sur les conversations
 * @returns Fonctions et états pour les opérations de mutation
 */
export function useConversationMutations() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();
  
  // Créer une conversation
  const createConversationMutation = useMutation({
    mutationFn: (title: string) => aiService.createConversation(title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
      showNotification('Conversation créée avec succès', 'success');
    },
    onError: (error) => {
      console.error('Erreur lors de la création de la conversation:', error);
      showNotification('Erreur lors de la création de la conversation', 'error');
    },
  });
  
  // Mettre à jour une conversation
  const updateConversationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; isActive?: boolean } }) => 
      aiService.updateConversation(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
      showNotification('Conversation mise à jour avec succès', 'success');
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      showNotification('Erreur lors de la mise à jour de la conversation', 'error');
    },
  });
  
  // Supprimer une conversation
  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => aiService.deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: conversationsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
      showNotification('Conversation supprimée avec succès', 'success');
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de la conversation:', error);
      showNotification('Erreur lors de la suppression de la conversation', 'error');
    },
  });
  
  // Archiver une conversation
  const archiveConversationMutation = useMutation({
    mutationFn: (id: string) => aiService.archiveConversation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
      showNotification('Conversation archivée avec succès', 'success');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'archivage de la conversation:', error);
      showNotification('Erreur lors de l\'archivage de la conversation', 'error');
    },
  });
  
  // Ajouter un message à une conversation
  const addMessageMutation = useMutation({
    mutationFn: ({ 
      conversationId, 
      message 
    }: { 
      conversationId: string; 
      message: { role: 'user' | 'assistant'; content: string } 
    }) => aiService.addMessageToConversation(conversationId, message),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.messages(data.id) });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.detail(data.id) });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'ajout du message:', error);
      showNotification('Erreur lors de l\'ajout du message', 'error');
    },
  });
  
  return {
    createConversation: useCallback(
      (title: string) => createConversationMutation.mutateAsync(title),
      [createConversationMutation]
    ),
    updateConversation: useCallback(
      (id: string, data: { title?: string; isActive?: boolean }) => 
        updateConversationMutation.mutateAsync({ id, data }),
      [updateConversationMutation]
    ),
    deleteConversation: useCallback(
      (id: string) => deleteConversationMutation.mutateAsync(id),
      [deleteConversationMutation]
    ),
    archiveConversation: useCallback(
      (id: string) => archiveConversationMutation.mutateAsync(id),
      [archiveConversationMutation]
    ),
    addMessage: useCallback(
      (conversationId: string, message: { role: 'user' | 'assistant'; content: string }) => 
        addMessageMutation.mutateAsync({ conversationId, message }),
      [addMessageMutation]
    ),
    isCreating: createConversationMutation.isPending,
    isUpdating: updateConversationMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
    isArchiving: archiveConversationMutation.isPending,
    isAddingMessage: addMessageMutation.isPending,
  };
}