/**
 * Service d'API pour l'agent IA
 * Gère l'interaction avec le service d'intelligence artificielle
 * @module api/ai
 */
import api from './client';
import handleApiError from './errorHandler';
import { AIQuery, AIResponse, AIPrediction } from '../../types';

/**
 * Vérifie l'état de santé du service IA
 * @returns Statut du service IA avec temps de fonctionnement
 */
export const checkAIHealth = async (): Promise<{status: string, uptime: number}> => {
  try {
    const response = await api.get<{status: string, uptime: number}>('/ai/health');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Envoie une requête à l'agent IA
 * @param query - Requête à l'IA incluant la question et le contexte optionnel
 * @returns Réponse de l'IA
 */
export const queryAI = async (query: AIQuery): Promise<AIResponse> => {
  try {
    const response = await api.post<AIResponse>('/ai/query', query);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Obtient une prédiction IA pour une échéance spécifique
 * @param deadlineId - ID de l'échéance à analyser
 * @returns Analyse prédictive de l'échéance
 */
export const getPrediction = async (deadlineId: string): Promise<AIPrediction> => {
  try {
    const response = await api.get<AIPrediction>(`/ai/predict/${deadlineId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  checkAIHealth,
  queryAI,
  getPrediction
};