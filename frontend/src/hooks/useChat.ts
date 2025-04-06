'use client';

import { useState } from 'react';
import { aiService, AIMessage } from '@/lib/api/ai';

/**
 * Hook personnalisé pour gérer l'interaction avec l'IA
 * @returns {Object} Méthodes et états pour interagir avec le chat IA
 */
export const useChat = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envoyer un message à l'agent IA et recevoir sa réponse
   * @param {string} content - Message utilisateur à envoyer
   */
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Vérifier la longueur du message (limitation du backend)
    if (content.length > 4000) {
      content = content.substring(0, 4000);
      // Notification à l'utilisateur
      console.warn('Votre message a été tronqué à 4000 caractères pour respecter les limitations du backend.');
    }
    
    // Ajouter le message utilisateur à la conversation
    const userMessage: AIMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Préparer le contexte de la conversation (historique récent)
      const context = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Envoyer la requête à l'API IA
      const response = await aiService.sendQuery(content, context);
      
      // Ajouter la réponse de l'IA à la conversation
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la communication avec l\'agent IA');
      console.error('Erreur de chat IA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effacer l'historique de conversation
   */
  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};