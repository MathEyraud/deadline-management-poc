/**
 * Énumération des niveaux de priorité des échéances
 */
export enum DeadlinePriority {
    CRITICAL = 'critique', // Priorité critique (urgente)
    HIGH = 'haute',        // Priorité haute
    MEDIUM = 'moyenne',    // Priorité moyenne
    LOW = 'basse',         // Priorité basse
  }
  
  /**
   * Énumération des statuts possibles d'une échéance
   */
  export enum DeadlineStatus {
    NEW = 'nouvelle',          // Nouvellement créée
    IN_PROGRESS = 'en cours',  // En cours de traitement
    PENDING = 'en attente',    // En attente d'une action externe
    COMPLETED = 'complétée',   // Terminée avec succès
    CANCELLED = 'annulée',     // Annulée
  }
  
  /**
   * Énumération des niveaux de visibilité d'une échéance
   */
  export enum DeadlineVisibility {
    PRIVATE = 'privée',         // Visible uniquement par le créateur
    TEAM = 'équipe',            // Visible par l'équipe du créateur
    DEPARTMENT = 'département', // Visible par le département entier
    ORGANIZATION = 'organisation', // Visible par toute l'organisation
  }
  
  /**
   * Interface représentant une échéance
   * Correspond à l'entité Deadline du backend
   */
  export interface Deadline {
    /** Identifiant unique de l'échéance */
    id: string;
    
    /** Titre de l'échéance */
    title: string;
    
    /** Description détaillée de l'échéance */
    description?: string;
    
    /** Date limite pour l'échéance */
    deadlineDate: string | Date;
    
    /** Date de création de l'échéance */
    createdAt: string | Date;
    
    /** ID de l'utilisateur créateur */
    creatorId: string;
    
    /** Informations sur le créateur (peut être inclus via relations) */
    creator?: User;
    
    /** Priorité de l'échéance */
    priority: DeadlinePriority | string;
    
    /** Statut actuel de l'échéance */
    status: DeadlineStatus | string;
    
    /** Visibilité de l'échéance */
    visibility: DeadlineVisibility | string;
    
    /** ID du projet associé */
    projectId?: string;
    
    /** Informations sur le projet (peut être inclus via relations) */
    project?: Project;
    
    /** Commentaires associés à cette échéance */
    comments?: Comment[];
    
    /** Pièces jointes associées à cette échéance */
    attachments?: Attachment[];
  }
  
  /**
   * Type pour les filtres d'échéances
   * Utilisé pour les requêtes API
   */
  export interface DeadlineFilters {
    /** Limite du nombre d'échéances à récupérer */
    limit?: number;
    
    /** Décalage pour la pagination */
    offset?: number;
    
    /** Champ de tri */
    sort?: string;
    
    /** Ordre de tri (asc/desc) */
    order?: 'asc' | 'desc';
    
    /** Filtre par statut */
    status?: DeadlineStatus | DeadlineStatus[] | string | string[];
    
    /** Filtre par priorité */
    priority?: DeadlinePriority | DeadlinePriority[] | string | string[];
    
    /** Filtre par visibilité */
    visibility?: DeadlineVisibility | DeadlineVisibility[] | string | string[];
    
    /** Filtre par projet */
    projectId?: string;
    
    /** Filtre par créateur */
    creatorId?: string;
    
    /** Recherche textuelle */
    search?: string;
    
    /** Date de début pour le filtre */
    startDate?: string | Date;
    
    /** Date de fin pour le filtre */
    endDate?: string | Date;
  }
  
  /**
   * Type pour la création d'une échéance
   * Omit les champs générés automatiquement
   */
  export type CreateDeadlineDto = Omit<Deadline, 'id' | 'createdAt' | 'comments' | 'attachments'>;
  
  /**
   * Type pour la mise à jour d'une échéance
   * Rend tous les champs optionnels
   */
  export type UpdateDeadlineDto = Partial<CreateDeadlineDto>;
  
  /**
   * Type pour les statistiques d'échéances
   * Utilisé pour les tableaux de bord
   */
  export interface DeadlineStats {
    /** Nombre total d'échéances */
    total: number;
    
    /** Nombre d'échéances à venir */
    upcoming: number;
    
    /** Nombre d'échéances en retard */
    overdue: number;
    
    /** Nombre d'échéances terminées */
    completed: number;
    
    /** Répartition par priorité */
    byPriority?: Record<string, number>;
    
    /** Répartition par statut */
    byStatus?: Record<string, number>;
  }
  
  // Import des types liés pour éviter les références circulaires
  import { User } from './user';
  import { Project } from './project';
  import { Comment } from './comment';
  import { Attachment } from './attachment';