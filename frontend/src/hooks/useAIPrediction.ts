/**
 * Hook personnalisé pour gérer les prédictions d'IA sur les échéances
 * @module hooks/useAIPrediction
 */
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../lib/api';
import { AIPrediction } from '../types';
import { useNotifications } from '@/app/providers';

/**
 * Clés de cache pour React Query
 */
export const aiPredictionKeys = {
  all: ['ai', 'predictions'] as const,
  details: () => [...aiPredictionKeys.all, 'detail'] as const,
  detail: (id: string) => [...aiPredictionKeys.details(), id] as const,
};

/**
 * Hook personnalisé pour les prédictions d'IA sur une échéance
 * @param deadlineId - ID de l'échéance à analyser
 * @param autoFetch - Si true, la prédiction sera automatiquement récupérée au montage
 * @returns Fonctions et états pour gérer les prédictions d'IA
 */
export function useAIPrediction(deadlineId: string, autoFetch: boolean = false) {
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  // Requête pour récupérer la prédiction
  const { 
    data: prediction,
    isLoading: isLoadingQuery,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: aiPredictionKeys.detail(deadlineId),
    queryFn: () => aiService.getPrediction(deadlineId),
    enabled: autoFetch, // Ne s'exécute automatiquement que si autoFetch est true
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
  
  // Mutation pour forcer le rafraîchissement d'une prédiction
  const refreshPredictionMutation = useMutation({
    mutationFn: () => aiService.getPrediction(deadlineId),
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(aiPredictionKeys.detail(deadlineId), data);
      showNotification('Analyse mise à jour avec succès', 'success');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'analyse prédictive:', error);
      showNotification('Erreur lors de l\'analyse prédictive', 'error');
    }
  });
  
  /**
   * Récupère ou rafraîchit la prédiction
   */
  const getPrediction = useCallback(() => {
    if (autoFetch) {
      // Si autoFetch est actif, on utilise refetch pour rafraîchir les données
      refetch();
    } else {
      // Sinon, on utilise la mutation
      refreshPredictionMutation.mutate();
    }
  }, [autoFetch, refetch, refreshPredictionMutation]);
  
  return {
    prediction: prediction || refreshPredictionMutation.data,
    isLoading: isLoadingQuery || refreshPredictionMutation.isPending,
    error: queryError || refreshPredictionMutation.error,
    getPrediction,
  };
}

export default useAIPrediction;