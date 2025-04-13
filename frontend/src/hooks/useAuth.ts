'use client';

/**
 * Hook personnalisé pour gérer l'authentification
 * Centralise toute la logique d'authentification pour l'application
 * Utilise React Query pour la gestion des états et mutations
 * @module hooks/useAuth
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api';
import { LoginCredentials, RegisterData, User } from '@/types';
import { useNotifications } from '@/app/providers';

/**
 * Interface pour le hook useAuth
 */
export interface UseAuthResult {
  /** Utilisateur actuellement connecté */
  user: User | null;
  
  /** État de chargement de l'authentification */
  loading: boolean;
  
  /** Erreur d'authentification */
  error: Error | null;
  
  /** Fonction pour se connecter */
  login: (credentials: LoginCredentials) => Promise<void>;
  
  /** Fonction pour s'enregistrer */
  register: (userData: RegisterData) => Promise<void>;
  
  /** Fonction pour se déconnecter */
  logout: () => void;
  
  /** Vérifie si l'utilisateur est authentifié */
  isAuthenticated: boolean;
}

/**
 * Hook personnalisé pour gérer l'authentification
 * @returns Fonctions et états pour gérer l'authentification
 */
export function useAuth(): UseAuthResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Charge l'utilisateur au montage du composant
  useEffect(() => {
    // Vérifie si on est côté client
    if (typeof window !== 'undefined') {
      setLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        
        setUser(currentUser);
        setIsAuthenticated(isAuth);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      setError(null);
      showNotification('Connexion réussie', 'success');
      
      // Invalider toutes les requêtes qui pourraient dépendre de l'état d'authentification
      queryClient.invalidateQueries();
      
      router.push('/dashboard');
    },
    onError: (err: Error) => {
      setError(err);
      setIsAuthenticated(false);
      showNotification('Échec de la connexion: ' + err.message, 'error');
    },
  });

  // Mutation pour l'enregistrement
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: () => {
      setError(null);
      showNotification('Compte créé avec succès', 'success');
      router.push('/login?registered=true');
    },
    onError: (err: Error) => {
      setError(err);
      showNotification('Échec de l\'inscription: ' + err.message, 'error');
    },
  });

  /**
   * Connexion d'un utilisateur
   * @param credentials - Identifiants de connexion
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      await loginMutation.mutateAsync(credentials);
    } finally {
      setLoading(false);
    }
  }, [loginMutation]);

  /**
   * Enregistrement d'un nouvel utilisateur
   * @param userData - Données du nouvel utilisateur
   */
  const register = useCallback(async (userData: RegisterData) => {
    setLoading(true);
    try {
      await registerMutation.mutateAsync(userData);
    } finally {
      setLoading(false);
    }
  }, [registerMutation]);

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    
    // Supprimer toutes les données en cache lors de la déconnexion
    queryClient.clear();
    
    showNotification('Vous avez été déconnecté', 'info');
    router.push('/login');
  }, [router, queryClient, showNotification]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
}

export default useAuth;