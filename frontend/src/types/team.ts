/**
 * Interface représentant une équipe
 * Correspond à l'entité Team du backend
 */
export interface Team {
    /** Identifiant unique de l'équipe */
    id: string;
    
    /** Nom de l'équipe */
    name: string;
    
    /** Description détaillée de l'équipe */
    description?: string;
    
    /** ID du chef d'équipe */
    leaderId: string;
    
    /** Informations sur le chef d'équipe (peut être inclus via relations) */
    leader?: User;
    
    /** Membres de l'équipe */
    members?: User[];
    
    /** Département auquel l'équipe appartient */
    department?: string;
    
    /** Projets associés à cette équipe */
    projects?: Project[];
  }
  
  /**
   * Type pour les filtres d'équipes
   * Utilisé pour les requêtes API
   */
  export interface TeamFilters {
    /** Limite du nombre d'équipes à récupérer */
    limit?: number;
    
    /** Décalage pour la pagination */
    offset?: number;
    
    /** Champ de tri */
    sort?: string;
    
    /** Ordre de tri (asc/desc) */
    order?: 'asc' | 'desc';
    
    /** Filtre par chef d'équipe */
    leaderId?: string;
    
    /** Filtre par membre */
    memberId?: string;
    
    /** Filtre par département */
    department?: string;
    
    /** Recherche textuelle */
    search?: string;
  }
  
  /**
   * Type pour la création d'une équipe
   * Omit les champs générés automatiquement ou relations complexes
   */
  export type CreateTeamDto = Omit<Team, 'id' | 'members' | 'projects'> & {
    /** IDs des membres initiaux à ajouter */
    memberIds?: string[];
  };
  
  /**
   * Type pour la mise à jour d'une équipe
   * Rend tous les champs optionnels
   */
  export type UpdateTeamDto = Partial<CreateTeamDto>;
  
  /**
   * Type pour l'ajout ou la suppression d'un membre
   */
  export interface TeamMemberOperation {
    /** ID de l'équipe */
    teamId: string;
    
    /** ID de l'utilisateur à ajouter/supprimer */
    userId: string;
  }
  
  // Import des types liés pour éviter les références circulaires
  import { User } from './user';
  import { Project } from './project';