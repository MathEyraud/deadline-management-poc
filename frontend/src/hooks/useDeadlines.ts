/**
 * Hook personnalisé pour gérer les échéances
 * @module hooks/useDeadlines
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deadlinesService } from '../lib/api';
import { Deadline, DeadlineFilters, CreateDeadlineDto, UpdateDeadlineDto } from '../types';
import { useNotifications } from '@/app/providers';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * Clés de cache pour React Query
 */
export const deadlinesKeys = {
  all: ['deadlines'] as const,
  lists: () => [...deadlinesKeys.all, 'list'] as const,
  list: (filters: DeadlineFilters) => [...deadlinesKeys.lists(), filters] as const,
  details: () => [...deadlinesKeys.all, 'detail'] as const,
  detail: (id: string) => [...deadlinesKeys.details(), id] as const,
  byProject: (projectId: string) => [...deadlinesKeys.lists(), 'project', projectId] as const,
  byUser: (userId: string) => [...deadlinesKeys.lists(), 'user', userId] as const,
  stats: () => [...deadlinesKeys.all, 'stats'] as const,
};

/**
 * Hook pour récupérer la liste des échéances avec filtres
 * @param filters - Filtres à appliquer
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useDeadlinesList(filters?: DeadlineFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: deadlinesKeys.list(filters || {}),
    queryFn: () => deadlinesService.getDeadlines(filters),
    enabled,
  });
}

/**
 * Hook pour récupérer une échéance par son ID
 * @param id - ID de l'échéance
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useDeadline(id: string, enabled: boolean = true) {
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  return useQuery<Deadline, Error>({
    queryKey: deadlinesKeys.detail(id),
    queryFn: async () => {
      try {
        return await deadlinesService.getDeadlineById(id);
      } catch (error) {
        // Vérifier si c'est une erreur d'autorisation (403)
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          showNotification("Vous n'avez pas accès à cette échéance", 'error');
          router.push('/dashboard/deadlines');
        }
        throw error; // Propager l'erreur pour que useQuery la gère
      }
    },
    enabled: !!id && enabled,
    retry: (failureCount, error) => {
      // Ne pas réessayer pour les erreurs 403
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      // Pour les autres erreurs, essayer jusqu'à 3 fois
      return failureCount < 3;
    }
  });
}

/**
 * Hook pour récupérer les échéances d'un projet
 * @param projectId - ID du projet
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useDeadlinesByProject(projectId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: deadlinesKeys.byProject(projectId),
    queryFn: () => deadlinesService.getDeadlinesByProject(projectId),
    enabled: !!projectId && enabled,
  });
}

/**
 * Hook pour récupérer les échéances d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useDeadlinesByUser(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: deadlinesKeys.byUser(userId),
    queryFn: () => deadlinesService.getDeadlinesByUser(userId),
    enabled: !!userId && enabled,
  });
}

/**
 * Hook pour récupérer les statistiques des échéances
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useDeadlineStats(enabled: boolean = true) {
  return useQuery({
    queryKey: deadlinesKeys.stats(),
    queryFn: () => deadlinesService.getDeadlineStats(),
    enabled,
  });
}

/**
 * Hook pour la création, la mise à jour et la suppression d'échéances
 * @returns Fonctions pour la gestion des échéances
 */
export function useDeadlineMutations() {
  const queryClient = useQueryClient();
  
  // Mutation pour créer une échéance
  const createDeadlineMutation = useMutation({
    mutationFn: (newDeadline: CreateDeadlineDto) => deadlinesService.createDeadline(newDeadline),
    onSuccess: () => {
      // Invalide toutes les listes d'échéances pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: deadlinesKeys.lists() });
    },
  });
  
  // Mutation pour mettre à jour une échéance
  const updateDeadlineMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeadlineDto }) => 
      deadlinesService.updateDeadline(id, data),
    onSuccess: (updatedDeadline) => {
      // Mise à jour du cache pour l'échéance modifiée
      queryClient.setQueryData(
        deadlinesKeys.detail(updatedDeadline.id),
        updatedDeadline
      );
      // Invalide les listes qui pourraient contenir cette échéance
      queryClient.invalidateQueries({ queryKey: deadlinesKeys.lists() });
    },
  });
  
  // Mutation pour supprimer une échéance
  const deleteDeadlineMutation = useMutation({
    mutationFn: (id: string) => deadlinesService.deleteDeadline(id),
    onSuccess: (_, id) => {
      // Supprime l'échéance du cache
      queryClient.removeQueries({ queryKey: deadlinesKeys.detail(id) });
      // Invalide les listes qui pourraient contenir cette échéance
      queryClient.invalidateQueries({ queryKey: deadlinesKeys.lists() });
    },
  });
  
  /**
   * Crée une nouvelle échéance
   * @param newDeadline - Données de la nouvelle échéance
   * @returns Promesse résolue avec l'échéance créée
   */
  const createDeadline = useCallback(
    (newDeadline: CreateDeadlineDto) => createDeadlineMutation.mutateAsync(newDeadline),
    [createDeadlineMutation]
  );
  
  /**
   * Met à jour une échéance existante
   * @param id - ID de l'échéance à mettre à jour
   * @param data - Données à mettre à jour
   * @returns Promesse résolue avec l'échéance mise à jour
   */
  const updateDeadline = useCallback(
    (id: string, data: UpdateDeadlineDto) => updateDeadlineMutation.mutateAsync({ id, data }),
    [updateDeadlineMutation]
  );
  
  /**
   * Supprime une échéance
   * @param id - ID de l'échéance à supprimer
   * @returns Promesse résolue quand l'échéance est supprimée
   */
  const deleteDeadline = useCallback(
    (id: string) => deleteDeadlineMutation.mutateAsync(id),
    [deleteDeadlineMutation]
  );
  
  return {
    createDeadline,
    updateDeadline,
    deleteDeadline,
    isCreating: createDeadlineMutation.isPending,
    isUpdating: updateDeadlineMutation.isPending,
    isDeleting: deleteDeadlineMutation.isPending,
    createError: createDeadlineMutation.error,
    updateError: updateDeadlineMutation.error,
    deleteError: deleteDeadlineMutation.error,
  };
}