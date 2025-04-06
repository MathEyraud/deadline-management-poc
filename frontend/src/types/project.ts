/**
 * Énumération des statuts possibles d'un projet
 */
export enum ProjectStatus {
    PLANNING = 'planification', // Phase de planification
    ACTIVE = 'actif',           // Projet en cours
    ON_HOLD = 'en pause',       // Projet temporairement suspendu
    COMPLETED = 'terminé',      // Projet terminé
    CANCELLED = 'annulé',       // Projet annulé
  }
  
  /**
   * Interface représentant un projet
   * Correspond à l'entité Project du backend
   */
  export interface Project {
    /** Identifiant unique du projet */
    id: string;
    
    /** Nom du projet */
    name: string;
    
    /** Description du projet */
    description?: string;
    
    /** Date de début du projet */
    startDate: string | Date;
    
    /** Date de fin prévue du projet */
    endDate?: string | Date;
    
    /** ID du responsable du projet */
    managerId: string;
    
    /** Informations sur le responsable (peut être inclus via relations) */
    manager?: User;
    
    /** Statut du projet */
    status: ProjectStatus | string;
    
    /** Niveau de sécurité ou classification du projet */
    securityLevel?: string;
    
    /** Date de création du projet */
    createdAt: string | Date;
    
    /** ID de l'équipe associée */
    teamId?: string;
    
    /** Informations sur l'équipe (peut être inclus via relations) */
    team?: Team;
    
    /** Échéances associées à ce projet */
    deadlines?: Deadline[];
  }
  
  /**
   * Type pour les filtres de projets
   * Utilisé pour les requêtes API
   */
  export interface ProjectFilters {
    /** Limite du nombre de projets à récupérer */
    limit?: number;
    
    /** Décalage pour la pagination */
    offset?: number;
    
    /** Champ de tri */
    sort?: string;
    
    /** Ordre de tri (asc/desc) */
    order?: 'asc' | 'desc';
    
    /** Filtre par statut */
    status?: ProjectStatus | ProjectStatus[] | string | string[];
    
    /** Filtre par niveau de sécurité */
    securityLevel?: string | string[];
    
    /** Filtre par responsable */
    managerId?: string;
    
    /** Filtre par équipe */
    teamId?: string;
    
    /** Recherche textuelle */
    search?: string;
    
    /** Filtre pour les projets actifs aux dates données */
    activeAtDate?: string | Date;
  }
  
  /**
   * Type pour la création d'un projet
   * Omit les champs générés automatiquement
   */
  export type CreateProjectDto = Omit<Project, 'id' | 'createdAt' | 'deadlines'>;
  
  /**
   * Type pour la mise à jour d'un projet
   * Rend tous les champs optionnels
   */
  export type UpdateProjectDto = Partial<CreateProjectDto>;
  
  // Import des types liés pour éviter les références circulaires
  import { User } from './user';
  import { Team } from './team';
  import { Deadline } from './deadline';