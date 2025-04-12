/**
 * Types pour l'interaction avec l'agent IA
 * @module types/ai
 */

/**
 * Message dans le contexte d'une conversation avec l'IA
 */
export interface AIMessageContext {
  /** Rôle dans la conversation (utilisateur ou assistant) */
  role: 'user' | 'assistant';
  
  /** Contenu du message */
  content: string;
}

/**
 * Structure d'une requête à l'agent IA
 */
export interface AIQuery {
  /** La question ou l'instruction de l'utilisateur */
  query: string;
  
  /** Contexte optionnel (historique de conversation) */
  context?: AIMessageContext[];
  
  /** Indique si l'IA doit inclure les informations sur les échéances dans sa réponse */
  includeDeadlines?: boolean;
  
  /** Indique si l'échange doit être sauvegardé dans l'historique des conversations */
  saveToHistory?: boolean;
}

/**
 * Structure de la réponse de l'agent IA
 */
export interface AIResponse {
  /** Réponse générée par le modèle d'IA */
  response: string;
  
  /** Temps de traitement en secondes */
  processing_time: number;
  
  /** Horodatage de la réponse */
  timestamp: string;
}

/**
 * Structure pour une prédiction d'échéance générée par l'IA
 */
export interface AIPrediction {
  /** ID de l'échéance analysée */
  deadline_id: string;
  
  /** Probabilité de complétion entre 0 et 1 */
  completion_probability: number;
  
  /** Facteurs de risque identifiés */
  risk_factors: string[];
  
  /** Recommandations pour augmenter les chances de succès */
  recommendations: string[];
  
  /** Temps de traitement en secondes */
  processing_time: number;
  
  /** Horodatage de la prédiction */
  timestamp: string;
}

// Exporter les types précédents pour la rétrocompatibilité
export * from './ai.legacy';