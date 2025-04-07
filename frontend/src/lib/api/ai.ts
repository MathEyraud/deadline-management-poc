/**
 * Service d'API pour l'agent IA
 * Gère l'interaction avec le service d'intelligence artificielle
 * @module api/ai
 */
import api from './client';
import handleApiError from './errorHandler';
import { AIQuery, AIResponse } from '../../types';

/**
 * Envoie une requête à l'agent IA
 * @param query - Requête à l'IA
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

export default {
  queryAI,
};