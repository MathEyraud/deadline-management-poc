/**
 * Modèle de données pour les échéances
 * Définit la structure de la table 'deadlines' dans la base de données
 * et les relations avec les autres entités.
 * @module DeadlineEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

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
 * Entité représentant une échéance dans le système
 * @entity Deadline
 */
@Entity('deadlines')
export class Deadline {
  /**
   * Identifiant unique de l'échéance (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Titre de l'échéance
   * Limité à 100 caractères
   */
  @Column({ length: 100 })
  title: string;

  /**
   * Description détaillée de l'échéance
   * Peut être nulle
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Date et heure de l'échéance
   */
  @Column({ type: 'datetime' })
  deadlineDate: Date;

  /**
   * Date et heure de création de l'échéance
   * Générée automatiquement
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Relation avec l'utilisateur créateur
   * eager: true permet de charger automatiquement cette relation
   */
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  /**
   * ID de l'utilisateur créateur (clé étrangère)
   */
  @Column()
  creatorId: string;

  /**
   * Priorité de l'échéance
   * Défaut: MEDIUM
   */
  @Column({
    type: 'simple-enum',
    enum: DeadlinePriority,
    default: DeadlinePriority.MEDIUM,
  })
  priority: DeadlinePriority;

  /**
   * Statut de l'échéance
   * Défaut: NEW
   */
  @Column({
    type: 'simple-enum',
    enum: DeadlineStatus,
    default: DeadlineStatus.NEW,
  })
  status: DeadlineStatus;

  /**
   * Visibilité de l'échéance
   * Défaut: PRIVATE
   */
  @Column({
    type: 'simple-enum',
    enum: DeadlineVisibility,
    default: DeadlineVisibility.PRIVATE,
  })
  visibility: DeadlineVisibility;

  /**
   * Relation avec le projet associé
   * Peut être nul (une échéance peut exister sans être liée à un projet)
   */
  @ManyToOne(() => Project, project => project.deadlines, { nullable: true })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  /**
   * ID du projet associé (clé étrangère)
   * Peut être nul
   */
  @Column({ nullable: true })
  projectId: string;

  /**
   * Relation avec les commentaires associés à cette échéance
   */
  @OneToMany(() => Comment, comment => comment.deadline)
  comments: Comment[];

  /**
   * Relation avec les pièces jointes associées à cette échéance
   */
  @OneToMany(() => Attachment, attachment => attachment.deadline)
  attachments: Attachment[];
}