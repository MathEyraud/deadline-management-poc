/**
 * Modèle de données pour les commentaires
 * Définit la structure de la table 'comments' dans la base de données
 * et les relations avec les autres entités.
 * @module CommentEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Deadline } from '../../deadlines/entities/deadline.entity';

/**
 * Énumération des niveaux de visibilité d'un commentaire
 */
export enum CommentVisibility {
  PRIVATE = 'privé',        // Visible uniquement par l'auteur et le créateur de l'échéance
  PUBLIC = 'public',        // Visible par tous ceux qui peuvent voir l'échéance
}

/**
 * Entité représentant un commentaire dans le système
 * @entity Comment
 */
@Entity('comments')
export class Comment {
  /**
   * Identifiant unique du commentaire (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Contenu du commentaire
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * Date et heure de création du commentaire
   * Générée automatiquement
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Relation avec l'utilisateur auteur du commentaire
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  /**
   * ID de l'auteur du commentaire (clé étrangère)
   */
  @Column()
  authorId: string;

  /**
   * Relation avec l'échéance associée à ce commentaire
   */
  @ManyToOne(() => Deadline, deadline => deadline.comments)
  @JoinColumn({ name: 'deadlineId' })
  deadline: Deadline;

  /**
   * ID de l'échéance associée (clé étrangère)
   */
  @Column()
  deadlineId: string;

  /**
   * Visibilité du commentaire
   * Détermine qui peut voir le commentaire
   * Défaut: PUBLIC
   */
  @Column({
    type: 'simple-enum',
    enum: CommentVisibility,
    default: CommentVisibility.PUBLIC,
  })
  visibility: CommentVisibility;
}