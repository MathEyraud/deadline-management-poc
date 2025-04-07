/**
 * Hook personnalisé pour gérer les utilisateurs
 * @module hooks/useUsers
 */
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../lib/api';
import { User, UserFilters, CreateUserDto, UpdateUserDto } from '../types';

/**
 * Clés de cache pour React Query
 */
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  byRole: (role: string) => [...usersKeys.lists(), 'role', role] as const,
  byDepartment: (department: string) => [...usersKeys.lists(), 'department', department] as const,
};

/**
 * Hook pour récupérer la liste des utilisateurs avec filtres
 * @param filters - Filtres à appliquer
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useUsersList(filters?: UserFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: usersKeys.list(filters || {}),
    queryFn: () => usersService.getUsers(filters),
    enabled,
  });
}

/**
 * Hook pour récupérer un utilisateur par son ID
 * @param id - ID de l'utilisateur
 * @param enabled - Activer/désactiver la requête
 * @returns Données et états de la requête
 */
export function useUser(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.getUserById(id),
    enabled: !!id && enabled,
  });
}

/**
 * Hook pour la création, la mise à jour et la suppression d'utilisateurs
 * @returns Fonctions pour la gestion des utilisateurs
 */
export function useUserMutations() {
  const queryClient = useQueryClient();
  
  // Mutation pour créer un utilisateur
  const createUserMutation = useMutation({
    mutationFn: (newUser: CreateUserDto) => usersService.createUser(newUser),
    onSuccess: () => {
      // Invalide toutes les listes d'utilisateurs pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
  
  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
      usersService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Mise à jour du cache pour l'utilisateur modifié
      queryClient.setQueryData(
        usersKeys.detail(updatedUser.id),
        updatedUser
      );
      // Invalide les listes qui pourraient contenir cet utilisateur
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
  
  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: (_, id) => {
      // Supprime l'utilisateur du cache
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) });
      // Invalide les listes qui pourraient contenir cet utilisateur
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
  
  return {
    createUser: useCallback(
      (newUser: CreateUserDto) => createUserMutation.mutateAsync(newUser),
      [createUserMutation]
    ),
    updateUser: useCallback(
      (id: string, data: UpdateUserDto) => updateUserMutation.mutateAsync({ id, data }),
      [updateUserMutation]
    ),
    deleteUser: useCallback(
      (id: string) => deleteUserMutation.mutateAsync(id),
      [deleteUserMutation]
    ),
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    createError: createUserMutation.error,
    updateError: updateUserMutation.error,
    deleteError: deleteUserMutation.error,
  };
}