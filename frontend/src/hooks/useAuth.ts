'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { User, LoginCredentials, CreateUserDto } from '@/types';

/**
 * Hook personnalisé pour gérer l'authentification dans l'application
 * @returns {Object} Méthodes et états liés à l'authentification
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        // Vérifier si un token est présent
        if (authService.isAuthenticated()) {
          try {
            // Essayer de récupérer l'utilisateur depuis l'API
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (apiError) {
            // Si l'API échoue, utiliser les données stockées localement
            const storedUser = authService.getStoredUser();
            setUser(storedUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Connexion utilisateur
   * @param {LoginCredentials} credentials - Identifiants de connexion
   * @returns {Promise<Object>} Résultat de connexion
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return { success: true, data: response };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de connexion'
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inscription utilisateur
   * @param {CreateUserDto} userData - Données du nouvel utilisateur
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  const register = async (userData: CreateUserDto) => {
    setIsLoading(true);
    try {
      const user = await authService.register(userData);
      return { success: true, data: user };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'inscription'
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };
};