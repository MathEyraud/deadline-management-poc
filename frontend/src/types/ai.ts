/**
 * Types pour l'interaction avec l'agent IA
 * @module types/ai
 */

/**
 * Structure d'une requête à l'agent IA
 */
export interface AIQuery {
    /** La question ou l'instruction de l'utilisateur */
    query: string;
    
    /** Contexte optionnel (historique de conversation, etc.) */
    context?: Array<{
      /** Rôle dans la conversation (user, assistant) */
      role: string;
      
      /** Contenu du message */
      content: string;
    }>;
  }
  
  /**
   * Structure de la réponse de l'agent IA
   */
  export interface AIResponse {
    /** Réponse générée par le modèle d'IA */
    response: string;
  }