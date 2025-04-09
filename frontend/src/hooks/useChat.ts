/**
 * Hook personnalisé pour gérer les interactions avec l'agent IA
 * Centralise la logique de conversation avec l'agent IA
 * @module hooks/useChat
 */
import { useState, useCallback, useRef, RefObject } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../lib/api';
import { AIQuery, AIResponse } from '../types';
import { useNotifications } from '@/app/providers';

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
 * Interface pour les résultats du hook useChat
 */
export interface UseChatResult {
  /** Liste des messages de la conversation */
  messages: ChatMessage[];
  
  /** Indique si une requête est en cours */
  isLoading: boolean;
  
  /** Erreur éventuelle */
  error: Error | null;
  
  /** Fonction pour envoyer un message */
  sendMessage: (content: string) => Promise<void>;
  
  /** Fonction pour effacer l'historique des messages */
  clearMessages: () => void;
  
  /** Référence au dernier message - peut être null */
  lastMessageRef: RefObject<HTMLDivElement | null>;
}

/**
 * Hook personnalisé pour gérer les conversations avec l'agent IA
 * @returns Fonctions et états pour gérer la conversation
 */
export function useChat(): UseChatResult {
  // État pour stocker l'historique des messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // État pour suivre si une requête est en cours
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // État pour stocker l'erreur
  const [error, setError] = useState<Error | null>(null);
  
  // Référence pour le scroll automatique - corrigé le type
  const lastMessageRef = useRef<HTMLDivElement>(null);
  
  // Système de notifications
  const { showNotification } = useNotifications();
  
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
      setError(null);
    },
    onError: (error: Error) => {
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
      setError(error);
      showNotification('Erreur de communication avec l\'IA', 'error');
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
    try {
      await aiMutation.mutateAsync({
        query: content,
        context,
      });
    } catch (err) {
      // Gestion des erreurs spécifiques (déjà gérée par onError)
    }
  }, [messages, aiMutation, showNotification]);
  
  /**
   * Efface l'historique des messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error,
    lastMessageRef,
  };
}

export default useChat;