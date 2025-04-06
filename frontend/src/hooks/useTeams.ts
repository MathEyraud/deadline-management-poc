'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsService } from '@/lib/api';
import { Team, CreateTeamDto, UpdateTeamDto } from '@/types';

/**
 * Hook personnalisé pour gérer les opérations CRUD sur les équipes
 * @returns {Object} Méthodes et états pour manipuler les équipes
 */
export const useTeams = () => {
  const queryClient = useQueryClient();
  
  /**
   * Récupération de toutes les équipes avec filtres optionnels
   * @param {Object} filters - Filtres optionnels (leaderId, department, etc.)
   * @returns {Object} Données, états de chargement et erreurs
   */
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsService.getAll()
  });
  
  /**
   * Récupération d'une équipe par son ID
   * @param {string} id - ID de l'équipe
   * @returns {Object} Données, états de chargement et erreurs
   */
  const useTeam = (id: string | null) => {
    return useQuery({
      queryKey: ['team', id],
      queryFn: () => teamsService.getById(id as string),
      enabled: !!id // Ne déclenche la requête que si l'ID est fourni
    });
  };
  
  // Création d'une équipe
  const createMutation = useMutation({
    mutationFn: (team: CreateTeamDto) => teamsService.create(team),
    onSuccess: () => {
      // Invalider le cache des équipes
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
  
  // Mise à jour d'une équipe
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) => 
      teamsService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
    }
  });
  
  // Suppression d'une équipe
  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsService.delete(id),
    onSuccess: (_, variables) => {
      // Invalider les requêtes et supprimer du cache
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.removeQueries({ queryKey: ['team', variables] });
    }
  });
  
  // Ajout de membre à une équipe
  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => 
      teamsService.addMember(teamId, userId),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
    }
  });
  
  // Retrait de membre d'une équipe
  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => 
      teamsService.removeMember(teamId, userId),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
    }
  });

  /**
   * Créer une nouvelle équipe
   * @param {CreateTeamDto} team - Données de l'équipe à créer
   * @returns {Promise<Team>} Équipe créée
   */
  const createTeam = async (team: CreateTeamDto): Promise<Team> => {
    return createMutation.mutateAsync(team);
  };

  /**
   * Mettre à jour une équipe existante
   * @param {string} id - ID de l'équipe
   * @param {UpdateTeamDto} data - Données à mettre à jour
   * @returns {Promise<Team>} Équipe mise à jour
   */
  const updateTeam = async (id: string, data: UpdateTeamDto): Promise<Team> => {
    return updateMutation.mutateAsync({ id, data });
  };

  /**
   * Supprimer une équipe
   * @param {string} id - ID de l'équipe
   * @returns {Promise<void>}
   */
  const deleteTeam = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  /**
   * Ajouter un membre à une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {string} userId - ID de l'utilisateur à ajouter
   * @returns {Promise<Team>} Équipe mise à jour
   */
  const addTeamMember = async (teamId: string, userId: string): Promise<Team> => {
    return addMemberMutation.mutateAsync({ teamId, userId });
  };

  /**
   * Retirer un membre d'une équipe
   * @param {string} teamId - ID de l'équipe
   * @param {string} userId - ID de l'utilisateur à retirer
   * @returns {Promise<Team>} Équipe mise à jour
   */
  const removeTeamMember = async (teamId: string, userId: string): Promise<Team> => {
    return removeMemberMutation.mutateAsync({ teamId, userId });
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    useTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingMember: addMemberMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending
  };
};