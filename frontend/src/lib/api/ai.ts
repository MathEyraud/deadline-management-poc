/**
 * Service d'API pour l'agent IA
 * Gère l'interaction avec le service d'intelligence artificielle
 * @module api/ai
 */
import api from './client';
import handleApiError from './errorHandler';
import { AIQuery, AIResponse, AIPrediction, Conversation, Message } from '../../types';

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

/**
 * Récupère toutes les conversations de l'utilisateur
 * @param activeOnly - Si true, ne récupère que les conversations actives
 * @returns Liste des conversations
 */
export const getConversations = async (activeOnly: boolean = true): Promise<Conversation[]> => {
  try {
    const response = await api.get<Conversation[]>(`/conversations?activeOnly=${activeOnly}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Crée une nouvelle conversation
 * @param title - Titre de la conversation
 * @returns Conversation créée
 */
export const createConversation = async (title: string): Promise<Conversation> => {
  try {
    const response = await api.post<Conversation>('/conversations', { title });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère une conversation par son ID
 * @param id - ID de la conversation
 * @returns Conversation détaillée
 */
export const getConversationById = async (id: string): Promise<Conversation> => {
  try {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Met à jour une conversation
 * @param id - ID de la conversation
 * @param data - Données à mettre à jour
 * @returns Conversation mise à jour
 */
export const updateConversation = async (
  id: string, 
  data: { title?: string; isActive?: boolean }
): Promise<Conversation> => {
  try {
    const response = await api.patch<Conversation>(`/conversations/${id}`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Supprime une conversation
 * @param id - ID de la conversation
 * @returns Message de confirmation
 */
export const deleteConversation = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Archive une conversation (la marque comme inactive)
 * @param id - ID de la conversation
 * @returns Conversation archivée
 */
export const archiveConversation = async (id: string): Promise<Conversation> => {
  try {
    const response = await api.patch<Conversation>(`/conversations/${id}/archive`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Récupère tous les messages d'une conversation
 * @param conversationId - ID de la conversation
 * @returns Liste de messages
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const response = await api.get<Message[]>(`/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Ajoute un message à une conversation
 * @param conversationId - ID de la conversation
 * @param message - Message à ajouter
 * @returns Conversation avec le nouveau message
 */
export const addMessageToConversation = async (
  conversationId: string,
  message: { role: 'user' | 'assistant'; content: string }
): Promise<Conversation> => {
  try {
    const response = await api.post<Conversation>(`/conversations/${conversationId}/messages`, message);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default {
  checkAIHealth,
  queryAI,
  getPrediction,
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation,
  archiveConversation,
  getConversationMessages,
  addMessageToConversation
};