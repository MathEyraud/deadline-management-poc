/**
 * Constantes globales pour l'application
 * Centralise les valeurs constantes utilisées dans plusieurs modules.
 * @module constants
 */

/**
 * Constantes de configuration de la base de données
 */
export const DATABASE_CONFIG = {
    /**
     * Type de base de données utilisé
     */
    TYPE: 'sqlite',
    
    /**
     * Nom du fichier de base de données pour SQLite
     */
    FILENAME: 'deadline-db.sqlite',
  };
  
  /**
   * Constantes liées à la sécurité
   */
  export const SECURITY_CONFIG = {
    /**
     * Durée de validité par défaut du token JWT (en secondes)
     */
    JWT_EXPIRATION: 28800, // 8 heures en secondes
    
    /**
     * Nombre de tours pour le hachage bcrypt
     */
    BCRYPT_ROUNDS: 10,
    
    /**
     * Durée maximale d'inactivité avant expiration de session (en secondes)
     */
    SESSION_TIMEOUT: 3600, // 1 heure en secondes
  };
  
  /**
   * Constantes liées à la pagination
   */
  export const PAGINATION_CONFIG = {
    /**
     * Nombre d'éléments par page par défaut
     */
    DEFAULT_PAGE_SIZE: 20,
    
    /**
     * Nombre maximum d'éléments par page
     */
    MAX_PAGE_SIZE: 100,
  };
  
  /**
   * Messages d'erreur standardisés
   */
  export const ERROR_MESSAGES = {
    /**
     * Message d'erreur pour une ressource non trouvée
     * @param resourceType Type de ressource
     * @param id Identifiant de la ressource
     * @returns Message d'erreur formaté
     */
    NOT_FOUND: (resourceType: string, id: string) => `${resourceType} avec ID "${id}" non trouvé(e)`,
    
    /**
     * Message d'erreur pour un accès non autorisé
     * @returns Message d'erreur standardisé
     */
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette opération',
    
    /**
     * Message d'erreur pour un conflit
     * @param field Champ en conflit
     * @returns Message d'erreur formaté
     */
    CONFLICT: (field: string) => `Ce ${field} est déjà utilisé`,
  };