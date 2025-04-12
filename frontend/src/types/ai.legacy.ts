/**
 * Types hérités pour la rétrocompatibilité
 * @deprecated Utiliser les nouveaux types définis dans ai.ts
 */

/**
 * Structure d'une requête à l'agent IA (format legacy)
 */
export interface AIQueryLegacy {
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
 * Structure de la réponse de l'agent IA (format legacy)
 */
export interface AIResponseLegacy {
    /** Réponse générée par le modèle d'IA */
    response: string;
}