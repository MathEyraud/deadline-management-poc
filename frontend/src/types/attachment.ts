/**
 * Interface représentant une pièce jointe
 * Correspond à l'entité Attachment du backend
 */
export interface Attachment {
    /** Identifiant unique de la pièce jointe */
    id: string;
    
    /** Nom du fichier */
    filename: string;
    
    /** Type MIME du fichier */
    mimeType: string;
    
    /** Taille du fichier en octets */
    size: number;
    
    /** Chemin de stockage du fichier */
    path: string;
    
    /** ID de l'échéance associée */
    deadlineId: string;
    
    /** Informations sur l'échéance (peut être inclus via relations) */
    deadline?: Deadline;
    
    /** ID de l'utilisateur ayant ajouté la pièce jointe */
    uploaderId: string;
    
    /** Informations sur l'uploader (peut être inclus via relations) */
    uploader?: User;
    
    /** Date et heure d'ajout de la pièce jointe */
    uploadedAt: string | Date;
    
    /** Niveau de classification du document */
    classification?: string;
  }
  
  /**
   * Type pour les filtres de pièces jointes
   * Utilisé pour les requêtes API
   */
  export interface AttachmentFilters {
    /** Limite du nombre de pièces jointes à récupérer */
    limit?: number;
    
    /** Décalage pour la pagination */
    offset?: number;
    
    /** Champ de tri */
    sort?: string;
    
    /** Ordre de tri (asc/desc) */
    order?: 'asc' | 'desc';
    
    /** Filtre par échéance */
    deadlineId?: string;
    
    /** Filtre par uploader */
    uploaderId?: string;
    
    /** Filtre par type de fichier */
    mimeType?: string;
    
    /** Filtre par classification */
    classification?: string;
    
    /** Recherche textuelle */
    search?: string;
  }
  
  /**
   * Type pour la réponse d'upload de fichier
   */
  export interface UploadResponse {
    /** L'objet pièce jointe créé */
    attachment: Attachment;
    
    /** URL pour accéder au fichier */
    url: string;
  }
  
  // Import des types liés pour éviter les références circulaires
  import { User } from './user';
  import { Deadline } from './deadline';