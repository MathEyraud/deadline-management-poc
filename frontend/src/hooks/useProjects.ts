'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/lib/api';
import { 
  Project, 
  ProjectFilters, 
  CreateProjectDto,
  UpdateProjectDto
} from '@/types';

/**
 * Hook personnalisé pour gérer les opérations CRUD sur les projets
 * Utilise l'API backend réelle via React Query
 * @param {ProjectFilters} filters - Options de filtrage pour les projets
 * @returns {Object} Méthodes et états pour manipuler les projets
 */
export const useProjects = (filters: ProjectFilters = {}) => {
  const queryClient = useQueryClient();
  
  // Récupération des projets
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsService.getAll(filters)
  });
  
  // Récupération d'un projet par ID
  const useProject = (id: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: () => projectsService.getById(id),
      enabled: !!id // Ne déclenche la requête que si l'ID est fourni
    });
  };
  
  // Création d'un projet
  const createMutation = useMutation({
    mutationFn: (project: CreateProjectDto) => projectsService.create(project),
    onSuccess: () => {
      // Invalider le cache pour forcer un rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
  
  // Mise à jour d'un projet
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) => 
      projectsService.update(id, data),
    onSuccess: (data, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    }
  });
  
  // Suppression d'un projet
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: (_, variables) => {
      // Invalider les requêtes et supprimer du cache
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['project', variables] });
    }
  });

  // Récupération des projets par gestionnaire
  const useProjectsByManager = (managerId: string | null) => {
    return useQuery({
      queryKey: ['projects', 'manager', managerId],
      queryFn: () => projectsService.getByManager(managerId as string),
      enabled: !!managerId // Ne déclenche la requête que si managerId est fourni
    });
  };

  // Récupération des projets par équipe
  const useProjectsByTeam = (teamId: string | null) => {
    return useQuery({
      queryKey: ['projects', 'team', teamId],
      queryFn: () => projectsService.getByTeam(teamId as string),
      enabled: !!teamId // Ne déclenche la requête que si teamId est fourni
    });
  };

  // Méthodes exposées pour l'utilisation dans les composants
  const createProject = async (project: CreateProjectDto): Promise<Project> => {
    return createMutation.mutateAsync(project);
  };

  const updateProject = async (id: string, data: UpdateProjectDto): Promise<Project> => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteProject = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    useProject,
    useProjectsByManager,
    useProjectsByTeam,
    createProject,
    updateProject,
    deleteProject,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};