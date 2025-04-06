import api, { handleApiError } from './client';

/**
 * Type pour représenter un message dans une conversation
 */
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  timestamp?: string | Date;
}

/**
 * Type pour la requête à l'IA
 */
export interface AIQueryRequest {
  query: string;
  context?: AIMessage[];
}

/**
 * Type pour la réponse de l'IA
 */
export interface AIQueryResponse {
  response: string;
  sources?: any[];
}

/**
 * Service pour interagir avec l'API IA
 */
export const aiService = {
  /**
   * Envoyer une requête à l'agent IA
   * @param {string} query - Question ou instruction utilisateur
   * @param {AIMessage[]} context - Contexte de la conversation
   * @returns {Promise<AIQueryResponse>} Réponse de l'agent IA
   */
  sendQuery: async (query: string, context: AIMessage[] = []): Promise<AIQueryResponse> => {
    try {
      // Vérification de la longueur de la requête pour respecter les limitations
      if (query.length > 4000) {
        query = query.substring(0, 4000);
        console.warn('La requête a été tronquée à 4000 caractères pour respecter les limitations du backend.');
      }
      
      const payload: AIQueryRequest = {
        query,
        context
      };
      
      const response = await api.post<AIQueryResponse>('/ai/query', payload);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

export default aiService;