/**
 * Énumération des niveaux de visibilité d'un commentaire
 */
export enum CommentVisibility {
    PRIVATE = 'privé',        // Visible uniquement par l'auteur et le créateur de l'échéance
    PUBLIC = 'public',        // Visible par tous ceux qui peuvent voir l'échéance
  }
  
  /**
   * Interface représentant un commentaire
   * Correspond à l'entité Comment du backend
   */
  export interface Comment {
    /** Identifiant unique du commentaire */
    id: string;
    
    /** Contenu du commentaire */
    content: string;
    
    /** Date et heure de création du commentaire */
    createdAt: string | Date;
    
    /** ID de l'auteur du commentaire */
    authorId: string;
    
    /** Informations sur l'auteur (peut être inclus via relations) */
    author?: User;
    
    /** ID de l'échéance associée */
    deadlineId: string;
    
    /** Informations sur l'échéance (peut être inclus via relations) */
    deadline?: Deadline;
    
    /** Visibilité du commentaire */
    visibility: CommentVisibility | string;
  }
  
  /**
   * Type pour les filtres de commentaires
   * Utilisé pour les requêtes API
   */
  export interface CommentFilters {
    /** Limite du nombre de commentaires à récupérer */
    limit?: number;
    
    /** Décalage pour la pagination */
    offset?: number;
    
    /** Champ de tri */
    sort?: string;
    
    /** Ordre de tri (asc/desc) */
    order?: 'asc' | 'desc';
    
    /** Filtre par échéance */
    deadlineId?: string;
    
    /** Filtre par auteur */
    authorId?: string;
    
    /** Filtre par visibilité */
    visibility?: CommentVisibility | string;
    
    /** Recherche textuelle */
    search?: string;
  }
  
  /**
   * Type pour la création d'un commentaire
   * Omit les champs générés automatiquement
   */
  export type CreateCommentDto = Omit<Comment, 'id' | 'createdAt' | 'author' | 'deadline'>;
  
  /**
   * Type pour la mise à jour d'un commentaire
   * Seuls contenu et visibilité peuvent être modifiés
   */
  export type UpdateCommentDto = Pick<Comment, 'content' | 'visibility'>;
  
  // Import des types liés pour éviter les références circulaires
  import { User } from './user';
  import { Deadline } from './deadline';