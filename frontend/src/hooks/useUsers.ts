'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/lib/api';
import { User, CreateUserDto, UpdateUserDto } from '@/types';

/**
 * Hook personnalisé pour gérer les opérations CRUD sur les utilisateurs
 * @returns {Object} Méthodes et états pour manipuler les utilisateurs
 */
export const useUsers = () => {
  const queryClient = useQueryClient();
  
  /**
   * Récupération de tous les utilisateurs avec filtres optionnels
   * @param {Object} filters - Filtres optionnels (role, department, etc.)
   * @returns {Object} Données, états de chargement et erreurs
   */
  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll()
  });
  
  /**
   * Récupération d'un utilisateur par son ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Object} Données, états de chargement et erreurs
   */
  const useUser = (id: string | null) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => usersService.getById(id as string),
      enabled: !!id // Ne déclenche la requête que si l'ID est fourni
    });
  };
  
  // Création d'un utilisateur
  const createMutation = useMutation({
    mutationFn: (user: CreateUserDto) => usersService.create(user),
    onSuccess: () => {
      // Invalider le cache des utilisateurs
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
  
  // Mise à jour d'un utilisateur
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => 
      usersService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    }
  });
  
  // Suppression d'un utilisateur
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: (_, variables) => {
      // Invalider les requêtes et supprimer du cache
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.removeQueries({ queryKey: ['user', variables] });
    }
  });
  
  /**
   * Créer un nouvel utilisateur
   * @param {CreateUserDto} user - Données de l'utilisateur à créer
   * @returns {Promise<User>} Utilisateur créé
   */
  const createUser = async (user: CreateUserDto): Promise<User> => {
    return createMutation.mutateAsync(user);
  };

  /**
   * Mettre à jour un utilisateur existant
   * @param {string} id - ID de l'utilisateur
   * @param {UpdateUserDto} data - Données à mettre à jour
   * @returns {Promise<User>} Utilisateur mis à jour
   */
  const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
    return updateMutation.mutateAsync({ id, data });
  };

  /**
   * Supprimer un utilisateur
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  const deleteUser = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  /**
   * Récupération des utilisateurs filtrés par rôle
   * @param {string} role - Rôle des utilisateurs à récupérer
   * @returns {Object} Données, états de chargement et erreurs
   */
  const useUsersByRole = (role: string | null) => {
    return useQuery({
      queryKey: ['users', 'role', role],
      queryFn: () => usersService.getAll({ role }),
      enabled: !!role // Ne déclenche la requête que si le rôle est fourni
    });
  };

  /**
   * Récupération des utilisateurs filtrés par département
   * @param {string} department - Département des utilisateurs à récupérer
   * @returns {Object} Données, états de chargement et erreurs
   */
  const useUsersByDepartment = (department: string | null) => {
    return useQuery({
      queryKey: ['users', 'department', department],
      queryFn: () => usersService.getAll({ department }),
      enabled: !!department // Ne déclenche la requête que si le département est fourni
    });
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    useUser,
    useUsersByRole,
    useUsersByDepartment,
    createUser,
    updateUser,
    deleteUser,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};