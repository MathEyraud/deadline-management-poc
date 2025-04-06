/**
 * Modèle de données pour les projets
 * Définit la structure de la table 'projects' dans la base de données
 * et les relations avec les autres entités.
 * @module ProjectEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Deadline } from '../../deadlines/entities/deadline.entity';
import { Team } from '../../teams/entities/team.entity';

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
 * Entité représentant un projet dans le système
 * @entity Project
 */
@Entity('projects')
export class Project {
  /**
   * Identifiant unique du projet (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nom du projet
   * Limité à 100 caractères
   */
  @Column({ length: 100 })
  name: string;

  /**
   * Description détaillée du projet
   * Peut être nulle
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Date de début du projet
   */
  @Column({ type: 'date' })
  startDate: Date;

  /**
   * Date de fin prévue du projet
   * Peut être nulle (pour les projets sans date de fin définie)
   */
  @Column({ type: 'date', nullable: true })
  endDate: Date;

  /**
   * Relation avec l'utilisateur responsable du projet
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'managerId' })
  manager: User;

  /**
   * ID du responsable du projet (clé étrangère)
   */
  @Column()
  managerId: string;

  /**
   * Statut du projet
   * Défaut: PLANNING
   */
  @Column({
    type: 'simple-enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  /**
   * Niveau de sécurité ou classification du projet
   * Peut être nul
   */
  @Column({ nullable: true })
  securityLevel: string;

  /**
   * Date et heure de création du projet
   * Générée automatiquement
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Relation avec les échéances associées à ce projet
   */
  @OneToMany(() => Deadline, deadline => deadline.project)
  deadlines: Deadline[];

  /**
   * Relation avec l'équipe associée à ce projet
   * Un projet peut être associé à une équipe
   */
  @ManyToOne(() => Team, team => team.projects, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  /**
   * ID de l'équipe associée (clé étrangère)
   * Peut être nul
   */
  @Column({ nullable: true })
  teamId: string;
}