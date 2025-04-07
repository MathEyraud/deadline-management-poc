/**
 * Hook personnalisé pour gérer les projets
 * @module hooks/useProjects
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../lib/api';
import { Project, ProjectFilters, CreateProjectDto, UpdateProjectDto } from '../types';

/**
 * Clés de cache pour React Query
 */
export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) => [...projectsKeys.lists(), filters] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
  byManager: (managerId: string) => [...projectsKeys.lists(), 'manager', managerId] as const,
  byTeam: (teamId: string) => [...projectsKeys.lists(), 'team', teamId] as const,
};

/**
 * Hook pour récupérer la liste des projets avec filtres
 * @param filters - Filtres à appliquer
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useProjectsList(filters?: ProjectFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: projectsKeys.list(filters || {}),
    queryFn: () => projectsService.getProjects(filters),
    enabled,
  });
}

/**
 * Hook pour récupérer un projet par son ID
 * @param id - ID du projet
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useProject(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: projectsKeys.detail(id),
    queryFn: () => projectsService.getProjectById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Hook pour récupérer les projets d'un gestionnaire
 * @param managerId - ID du gestionnaire
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useProjectsByManager(managerId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: projectsKeys.byManager(managerId),
    queryFn: () => projectsService.getProjectsByManager(managerId),
    enabled: !!managerId && enabled,
  });
}

/**
 * Hook pour récupérer les projets d'une équipe
 * @param teamId - ID de l'équipe
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useProjectsByTeam(teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: projectsKeys.byTeam(teamId),
    queryFn: () => projectsService.getProjectsByTeam(teamId),
    enabled: !!teamId && enabled,
  });
}

/**
 * Hook pour la création, la mise à jour et la suppression de projets
 * @returns Fonctions pour la gestion des projets
 */
export function useProjectMutations() {
  const queryClient = useQueryClient();
  
  // Mutation pour créer un projet
  const createProjectMutation = useMutation({
    mutationFn: (newProject: CreateProjectDto) => projectsService.createProject(newProject),
    onSuccess: () => {
      // Invalide toutes les listes de projets pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });
  
  // Mutation pour mettre à jour un projet
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) => 
      projectsService.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Mise à jour du cache pour le projet modifié
      queryClient.setQueryData(
        projectsKeys.detail(updatedProject.id),
        updatedProject
      );
      // Invalide les listes qui pourraient contenir ce projet
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });
  
  // Mutation pour supprimer un projet
  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: (_, id) => {
      // Supprime le projet du cache
      queryClient.removeQueries({ queryKey: projectsKeys.detail(id) });
      // Invalide les listes qui pourraient contenir ce projet
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
    },
  });
  
  return {
    createProject: useCallback(
      (newProject: CreateProjectDto) => createProjectMutation.mutateAsync(newProject),
      [createProjectMutation]
    ),
    updateProject: useCallback(
      (id: string, data: UpdateProjectDto) => updateProjectMutation.mutateAsync({ id, data }),
      [updateProjectMutation]
    ),
    deleteProject: useCallback(
      (id: string) => deleteProjectMutation.mutateAsync(id),
      [deleteProjectMutation]
    ),
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    createError: createProjectMutation.error,
    updateError: updateProjectMutation.error,
    deleteError: deleteProjectMutation.error,
  };
}