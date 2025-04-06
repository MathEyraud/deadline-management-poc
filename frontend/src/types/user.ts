/**
 * Énumération des rôles possibles pour un utilisateur
 */
export enum UserRole {
    ADMIN = 'admin',     // Administrateur système
    MANAGER = 'manager', // Gestionnaire d'équipe/projet
    USER = 'user',       // Utilisateur standard
  }
  
  /**
   * Interface représentant un utilisateur
   * Correspond à l'entité User du backend
   */
  export interface User {
    /** Identifiant unique de l'utilisateur */
    id: string;
    
    /** Prénom de l'utilisateur */
    firstName: string;
    
    /** Nom de famille de l'utilisateur */
    lastName: string;
    
    /** Email de l'utilisateur (unique) */
    email: string;
    
    /** Rôle de l'utilisateur dans le système */
    role: UserRole | string;
    
    /** Département ou équipe de l'utilisateur */
    department?: string;
    
    /** État du compte (actif/inactif) */
    isActive: boolean;
    
    /** Préférences de notification stockées au format JSON */
    notificationPreferences?: any;
    
    /** Échéances créées par cet utilisateur */
    deadlines?: Deadline[];
  }
  
  /**
   * Type pour les filtres d'utilisateurs
   * Utilisé pour les requêtes API
   */
  export interface UserFilters {
    /** Limite du nombre d'utilisateurs à récupérer */
    limit?: number;
    
    /** Décalage pour la pagination */
    offset?: number;
    
    /** Champ de tri */
    sort?: string;
    
    /** Ordre de tri (asc/desc) */
    order?: 'asc' | 'desc';
    
    /** Filtre par rôle */
    role?: UserRole | UserRole[] | string | string[];
    
    /** Filtre par département */
    department?: string;
    
    /** Filtre par état d'activité */
    isActive?: boolean;
    
    /** Recherche textuelle */
    search?: string;
  }
  
  /**
   * Type pour la création d'un utilisateur
   * Inclut le mot de passe
   */
  export interface CreateUserDto extends Omit<User, 'id' | 'deadlines'> {
    /** Mot de passe en clair (sera haché côté serveur) */
    password: string;
  }
  
  /**
   * Type pour la mise à jour d'un utilisateur
   * Rend tous les champs optionnels
   */
  export type UpdateUserDto = Partial<Omit<CreateUserDto, 'email'>>;
  
  /**
   * Type pour les informations de connexion
   */
  export interface LoginCredentials {
    /** Email de l'utilisateur */
    email: string;
    
    /** Mot de passe en clair */
    password: string;
  }
  
  /**
   * Type pour la réponse d'authentification
   */
  export interface AuthResponse {
    /** Token d'accès JWT */
    access_token: string;
    
    /** Informations de l'utilisateur connecté */
    user: User;
  }
  
  // Import des types liés pour éviter les références circulaires
  import { Deadline } from './deadline';