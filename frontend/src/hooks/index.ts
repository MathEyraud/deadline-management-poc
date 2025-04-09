/**
 * Point d'entrée centralisé pour tous les hooks personnalisés
 * Facilite l'importation en fournissant un chemin unique
 * @module hooks
 */

// Exportation des hooks d'authentification
export * from './useAuth';

// Exportation des hooks pour les échéances
export * from './useDeadlines';

// Exportation des hooks pour les projets
export * from './useProjects';

// Exportation des hooks pour les équipes
export * from './useTeams';

// Exportation des hooks pour les utilisateurs
export * from './useUsers';

// Exportation des hooks pour les commentaires
export * from './useComments';

// Exportation des hooks pour les pièces jointes
export * from './useAttachments';

// Exportation des hooks pour le chat IA
export * from './useChat';

// Exemple d'utilisation:
// import { useAuth, useDeadlines, useChat } from '@/hooks';