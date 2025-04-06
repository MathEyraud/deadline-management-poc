'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deadlinesService } from '@/lib/api';
import { 
  Deadline, 
  DeadlineFilters, 
  CreateDeadlineDto,
  UpdateDeadlineDto
} from '@/types';

/**
 * Hook personnalisé pour gérer les opérations CRUD sur les échéances
 * Utilise l'API backend réelle via React Query
 * @param {DeadlineFilters} filters - Options de filtrage pour les échéances
 * @returns {Object} Méthodes et états pour manipuler les échéances
 */
export const useDeadlines = (filters: DeadlineFilters = {}) => {
  const queryClient = useQueryClient();
  
  // Récupération des échéances
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['deadlines', filters],
    queryFn: () => deadlinesService.getAll(filters)
  });
  
  // Récupération d'une échéance par ID
  const useDeadline = (id: string) => {
    return useQuery({
      queryKey: ['deadline', id],
      queryFn: () => deadlinesService.getById(id),
      enabled: !!id // Ne déclenche la requête que si l'ID est fourni
    });
  };
  
  // Création d'une échéance
  const createMutation = useMutation({
    mutationFn: (deadline: CreateDeadlineDto) => deadlinesService.create(deadline),
    onSuccess: () => {
      // Invalider le cache pour forcer un rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
    }
  });
  
  // Mise à jour d'une échéance
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeadlineDto }) => 
      deadlinesService.update(id, data),
    onSuccess: (data, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.invalidateQueries({ queryKey: ['deadline', variables.id] });
    }
  });
  
  // Suppression d'une échéance
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deadlinesService.delete(id),
    onSuccess: (_, variables) => {
      // Invalider les requêtes et supprimer du cache
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      queryClient.removeQueries({ queryKey: ['deadline', variables] });
    }
  });

  // Récupération des échéances par projet
  const useDeadlinesByProject = (projectId: string | null) => {
    return useQuery({
      queryKey: ['deadlines', 'project', projectId],
      queryFn: () => deadlinesService.getByProject(projectId as string),
      enabled: !!projectId // Ne déclenche la requête que si projectId est fourni
    });
  };

  // Récupération des échéances par utilisateur
  const useDeadlinesByUser = (userId: string | null) => {
    return useQuery({
      queryKey: ['deadlines', 'user', userId],
      queryFn: () => deadlinesService.getByUser(userId as string),
      enabled: !!userId // Ne déclenche la requête que si userId est fourni
    });
  };

  // Méthodes exposées pour l'utilisation dans les composants
  const createDeadline = async (deadline: CreateDeadlineDto): Promise<Deadline> => {
    return createMutation.mutateAsync(deadline);
  };

  const updateDeadline = async (id: string, data: UpdateDeadlineDto): Promise<Deadline> => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteDeadline = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    useDeadline,
    useDeadlinesByProject,
    useDeadlinesByUser,
    createDeadline,
    updateDeadline,
    deleteDeadline,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};