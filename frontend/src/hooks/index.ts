/**
 * Point d'entrée centralisé pour tous les hooks personnalisés
 * Facilite l'importation en fournissant un chemin unique
 * @module hooks
 */

// Hooks d'authentification
export * from './useAuth';

// Hooks pour les échéances
export * from './useDeadlines';

// Hooks pour les projets
export * from './useProjects';

// Hooks pour les équipes
export * from './useTeams';

// Hooks pour les utilisateurs
export * from './useUsers';

// Hooks pour les commentaires
export * from './useComments';

// Hooks pour les pièces jointes
export * from './useAttachments';

// Hooks pour le chat IA
export * from './useChat';

// Hook pour la recherche hybride (frontend et backend)
export * from './useHybridSearch';

// Hook pour détecter les clics en dehors d'un élément
export * from './useClickAway';

// Hook pour gérer les raccourcis clavier
export * from './useHotkeys';

// Exemple d'utilisation:
// import { useAuth, useDeadlines, useChat, useHybridSearch } from '@/hooks';