/**
 * Modèle de données pour les utilisateurs
 * Définit la structure de la table 'users' dans la base de données
 * et les relations avec les autres entités.
 * @module UserEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Deadline } from '../../deadlines/entities/deadline.entity';

/**
 * Énumération des rôles possibles pour un utilisateur
 */
export enum UserRole {
  ADMIN = 'admin',     // Administrateur système
  MANAGER = 'manager', // Gestionnaire d'équipe/projet
  USER = 'user',       // Utilisateur standard
}

/**
 * Entité représentant un utilisateur dans le système
 * @entity User
 */
@Entity('users')
export class User {
  /**
   * Identifiant unique de l'utilisateur (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Prénom de l'utilisateur
   * Limité à 50 caractères
   */
  @Column({ length: 50 })
  firstName: string;

  /**
   * Nom de famille de l'utilisateur
   * Limité à 50 caractères
   */
  @Column({ length: 50 })
  lastName: string;

  /**
   * Email de l'utilisateur (unique)
   * Utilisé comme identifiant de connexion
   */
  @Column({ unique: true })
  email: string;

  /**
   * Mot de passe hashé de l'utilisateur
   * select: false empêche le chargement par défaut de ce champ
   * pour des raisons de sécurité
   */
  @Column({ select: false })
  password: string;

  /**
   * Rôle de l'utilisateur dans le système
   * Défaut: USER
   */
  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /**
   * Département ou équipe de l'utilisateur
   * Peut être nul
   */
  @Column({ nullable: true })
  department: string;

  /**
   * État du compte (actif/inactif)
   * Défaut: true (actif)
   */
  @Column({ default: true })
  isActive: boolean;

  /**
   * Préférences de notification stockées au format JSON
   * Peut être nul
   */
  @Column({ type: 'json', nullable: true })
  notificationPreferences: any;

  /**
   * Relation avec les échéances créées par cet utilisateur
   */
  @OneToMany(() => Deadline, deadline => deadline.creator)
  deadlines: Deadline[];
}