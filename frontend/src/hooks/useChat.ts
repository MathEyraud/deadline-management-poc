/**
 * Hook personnalisé pour gérer les interactions avec l'agent IA
 * Centralise la logique de conversation avec l'agent IA
 * @module hooks/useChat
 */
import { useState, useCallback, useRef, RefObject, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../lib/api';
import { AIQuery, AIResponse, Conversation, Message } from '../types';
import { useNotifications } from '@/app/providers';
import { useConversationMessages, conversationsKeys } from './useConversations';

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
  
  /** Fonction pour changer de conversation active */
  setActiveConversation: (conversationId: string | null) => void;
  
  /** ID de la conversation active */
  activeConversationId: string | null;
  
  /** Référence au dernier message - peut être null */
  lastMessageRef: RefObject<HTMLDivElement | null>;
  
  /** État de santé du service IA */
  aiHealth: { status: string, uptime: number } | null;
  
  /** Indique si les messages sont chargés depuis une conversation existante */
  isLoadingConversation: boolean;
}

// Nombre maximal de messages à conserver dans le contexte envoyé à l'IA
const MAX_CONTEXT_MESSAGES = 20;

/**
 * Hook personnalisé pour gérer les conversations avec l'agent IA
 * @returns Fonctions et états pour gérer la conversation
 */
export function useChat(): UseChatResult {
  // État pour stocker l'historique des messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // État pour stocker la conversation active
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // État pour suivre si une requête est en cours
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // État pour stocker l'erreur
  const [error, setError] = useState<Error | null>(null);
  
  // État pour l'état de santé du service IA
  const [aiHealth, setAIHealth] = useState<{ status: string, uptime: number } | null>(null);
  
  // Référence pour le scroll automatique
  const lastMessageRef = useRef<HTMLDivElement>(null);
  
  // Système de notifications
  const { showNotification } = useNotifications();
  
  // Client de requête pour la mise en cache
  const queryClient = useQueryClient();
  
  // Récupérer les messages de la conversation active
  const { 
    data: conversationMessages = [],
    isLoading: isLoadingConversation,
    refetch: refetchMessages
  } = useConversationMessages(activeConversationId, !!activeConversationId);
  
  // Mettre à jour les messages locaux lorsque les messages de la conversation changent
  useEffect(() => {
    if (conversationMessages.length > 0 && activeConversationId) {
      const formattedMessages = conversationMessages.map(msg => ({
        id: msg.id || `${Date.now()}-${Math.random()}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      }));
      
      setMessages(formattedMessages);
    }
  }, [conversationMessages, activeConversationId]);
  
  // Vérifier l'état de santé du service IA au montage
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await aiService.checkAIHealth();
        setAIHealth(health);
      } catch (err) {
        console.warn('Service IA indisponible:', err);
        setAIHealth(null);
      }
    };
    
    checkHealth();
    
    // Vérifier périodiquement l'état du service (toutes les 5 minutes)
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mutation pour envoyer une requête à l'IA
  const aiMutation = useMutation({
    mutationFn: (query: AIQuery) => aiService.queryAI(query),
    onSuccess: (response: AIResponse, variables) => {
      // Ajoute la réponse de l'IA à l'historique des messages
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp || Date.now()),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setError(null);
      
      // Si une conversation a été créée ou mise à jour, stocke son ID
      if (response.conversation && response.conversation.id) {
        setActiveConversationId(response.conversation.id);
        
        // Invalider les requêtes pour mettre à jour la liste des conversations
        queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
        
        // Invalider les requêtes pour la conversation spécifique
        queryClient.invalidateQueries({ 
          queryKey: conversationsKeys.detail(response.conversation.id) 
        });
        
        // Si des messages ont été ajoutés, recharger les messages
        if (variables.saveToHistory) {
          refetchMessages();
        }
      }
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
      
      // Si le service est indisponible (503)
      if (error.message.includes('503') || error.message.includes('unavailable')) {
        showNotification('Le service IA est temporairement indisponible', 'error');
        // Mettre à jour l'état de santé
        setAIHealth(null);
      } else {
        showNotification('Erreur de communication avec l\'IA', 'error');
      }
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
    
    // Prépare le contexte pour l'IA (derniers messages)
    const recentMessages = [...messages, userMessage].slice(-MAX_CONTEXT_MESSAGES);
    const context = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Envoie la requête à l'IA avec le nouveau format
    try {
      await aiMutation.mutateAsync({
        query: content,
        context,
        includeDeadlines: true,
        saveToHistory: true,
        conversationId: activeConversationId || undefined
      });
    } catch (err) {
      // Gestion des erreurs spécifiques (déjà gérée par onError)
    }
  }, [messages, aiMutation, activeConversationId, showNotification, refetchMessages]);
  
  /**
   * Efface l'historique des messages et réinitialise la conversation active
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
    setError(null);
  }, []);
  
  /**
   * Change la conversation active
   * @param conversationId - ID de la conversation à activer
   */
  const changeActiveConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId);
    // Réinitialiser les messages si on désactive la conversation
    if (!conversationId) {
      setMessages([]);
    }
  }, []);
  
  return {
    messages,
    sendMessage,
    clearMessages,
    setActiveConversation: changeActiveConversation,
    activeConversationId,
    isLoading,
    error,
    lastMessageRef,
    aiHealth,
    isLoadingConversation,
  };
}

export default useChat;