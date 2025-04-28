/**
 * Hook personnalisé pour gérer les équipes
 * @module hooks/useTeams
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsService } from '../lib/api';
import { Team, TeamFilters, CreateTeamDto, UpdateTeamDto } from '../types';

/**
 * Clés de cache pour React Query
 */
export const teamsKeys = {
  all: ['teams'] as const,
  lists: () => [...teamsKeys.all, 'list'] as const,
  list: (filters: TeamFilters) => [...teamsKeys.lists(), filters] as const,
  details: () => [...teamsKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamsKeys.details(), id] as const,
  byLeader: (leaderId: string) => [...teamsKeys.lists(), 'leader', leaderId] as const,
  byDepartment: (department: string) => [...teamsKeys.lists(), 'department', department] as const,
};

/**
 * Hook pour récupérer la liste des équipes avec filtres
 * @param filters - Filtres à appliquer
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useTeamsList(filters?: TeamFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: teamsKeys.list(filters || {}),
    queryFn: () => teamsService.getTeams(filters),
    enabled,
  });
}

/**
 * Hook pour récupérer une équipe par son ID
 * @param id - ID de l'équipe
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useTeam(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: teamsKeys.detail(id),
    queryFn: () => teamsService.getTeamById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Hook pour la création, la mise à jour et la suppression d'équipes
 * et la gestion des membres
 * @returns Fonctions pour la gestion des équipes
 */
export function useTeamMutations() {
  const queryClient = useQueryClient();
  
  // Mutation pour créer une équipe
  const createTeamMutation = useMutation({
    mutationFn: (newTeam: CreateTeamDto) => teamsService.createTeam(newTeam),
    onSuccess: () => {
      // Invalide toutes les listes d'équipes pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
    },
  });
  
  // Mutation pour mettre à jour une équipe
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) => 
      teamsService.updateTeam(id, data),
    onSuccess: (updatedTeam) => {
      // Mise à jour du cache pour l'équipe modifiée
      queryClient.setQueryData(
        teamsKeys.detail(updatedTeam.id),
        updatedTeam
      );
      // Invalide les listes qui pourraient contenir cette équipe
      queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
    },
  });
  
  // Mutation pour supprimer une équipe
  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => teamsService.deleteTeam(id),
    onSuccess: (_, id) => {
      // Supprime l'équipe du cache
      queryClient.removeQueries({ queryKey: teamsKeys.detail(id) });
      // Invalide les listes qui pourraient contenir cette équipe
      queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
    },
  });
  
  // Mutation pour ajouter un membre à une équipe
  const addTeamMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => 
      teamsService.addTeamMember(teamId, userId),
    onSuccess: (updatedTeam) => {
      // Mise à jour du cache pour l'équipe modifiée
      queryClient.setQueryData(
        teamsKeys.detail(updatedTeam.id),
        updatedTeam
      );
      // Invalide les listes qui pourraient contenir cette équipe
      queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
    },
  });

  // Mutation pour ajouter plusieurs membres à une équipe
  const addTeamMembersMutation = useMutation({
    mutationFn: ({ teamId, memberIds }: { teamId: string; memberIds: string[] }) => 
      teamsService.addTeamMembers(teamId, memberIds),
    onSuccess: (updatedTeam) => {
      // Mise à jour du cache pour l'équipe modifiée
      queryClient.setQueryData(
        teamsKeys.detail(updatedTeam.id),
        updatedTeam
      );
      // Invalide les listes qui pourraient contenir cette équipe
      queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
    },
  });
  
  // Mutation pour retirer un membre d'une équipe
  const removeTeamMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => 
      teamsService.removeTeamMember(teamId, userId),
    onSuccess: (updatedTeam) => {
      // Mise à jour du cache pour l'équipe modifiée
      queryClient.setQueryData(
        teamsKeys.detail(updatedTeam.id),
        updatedTeam
      );
      // Invalide les listes qui pourraient contenir cette équipe
      queryClient.invalidateQueries({ queryKey: teamsKeys.lists() });
    },
  });
  
  return {
    createTeam: useCallback(
      (newTeam: CreateTeamDto) => createTeamMutation.mutateAsync(newTeam),
      [createTeamMutation]
    ),
    updateTeam: useCallback(
      (id: string, data: UpdateTeamDto) => updateTeamMutation.mutateAsync({ id, data }),
      [updateTeamMutation]
    ),
    deleteTeam: useCallback(
      (id: string) => deleteTeamMutation.mutateAsync(id),
      [deleteTeamMutation]
    ),
    addTeamMember: useCallback(
      (teamId: string, userId: string) => addTeamMemberMutation.mutateAsync({ teamId, userId }),
      [addTeamMemberMutation]
    ),
    addTeamMembers: useCallback(
      (teamId: string, memberIds: string[]) => addTeamMembersMutation.mutateAsync({ teamId, memberIds }),
      [addTeamMembersMutation]
    ),
    removeTeamMember: useCallback(
      (teamId: string, userId: string) => removeTeamMemberMutation.mutateAsync({ teamId, userId }),
      [removeTeamMemberMutation]
    ),
    isCreating: createTeamMutation.isPending,
    isUpdating: updateTeamMutation.isPending,
    isDeleting: deleteTeamMutation.isPending,
    isAddingMember: addTeamMemberMutation.isPending,
    isAddingMembers: addTeamMembersMutation.isPending,
    isRemovingMember: removeTeamMemberMutation.isPending,
    createError: createTeamMutation.error,
    updateError: updateTeamMutation.error,
    deleteError: deleteTeamMutation.error,
    addMemberError: addTeamMemberMutation.error,
    addMembersError: addTeamMembersMutation.error,
    removeMemberError: removeTeamMemberMutation.error,
  };
}