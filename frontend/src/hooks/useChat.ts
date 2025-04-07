/**
 * Hook personnalisé pour gérer les interactions avec l'agent IA
 * @module hooks/useChat
 */
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../lib/api';
import { AIQuery, AIResponse } from '../types';

/**
 * Type pour un message de chat
 */
export interface ChatMessage {
  /** Identifiant unique du message */
  id: string;
  
  /** Rôle de l'expéditeur (user, assistant) */
  role: 'user' | 'assistant';
  
  /** Contenu du message */
  content: string;
  
  /** Date et heure d'envoi du message */
  timestamp: Date;
}

/**
 * Hook personnalisé pour gérer les conversations avec l'agent IA
 * @returns Fonctions et états pour gérer la conversation
 */
export function useChat() {
  // État pour stocker l'historique des messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // État pour suivre si une requête est en cours
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mutation pour envoyer une requête à l'IA
  const aiMutation = useMutation({
    mutationFn: (query: AIQuery) => aiService.queryAI(query),
    onSuccess: (response: AIResponse, variables) => {
      // Ajoute la réponse de l'IA à l'historique des messages
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Erreur lors de la communication avec l\'IA:', error);
      
      // Ajoute un message d'erreur à l'historique
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    },
  });
  
  /**
   * Envoie un message à l'agent IA
   * @param content - Contenu du message
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Crée un nouveau message utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Ajoute le message à l'historique
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Prépare le contexte pour l'IA (5 derniers messages)
    const recentMessages = [...messages, userMessage].slice(-5);
    const context = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Envoie la requête à l'IA
    await aiMutation.mutateAsync({
      query: content,
      context,
    });
  }, [messages, aiMutation]);
  
  /**
   * Efface l'historique des messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
  };
}

export default useChat;