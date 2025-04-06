/**
 * Modèle de données pour les pièces jointes
 * Définit la structure de la table 'attachments' dans la base de données
 * et les relations avec les autres entités.
 * @module AttachmentEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Deadline } from '../../deadlines/entities/deadline.entity';

/**
 * Entité représentant une pièce jointe dans le système
 * @entity Attachment
 */
@Entity('attachments')
export class Attachment {
  /**
   * Identifiant unique de la pièce jointe (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nom du fichier
   */
  @Column({ length: 255 })
  filename: string;

  /**
   * Type MIME du fichier
   */
  @Column({ length: 100 })
  mimeType: string;

  /**
   * Taille du fichier en octets
   */
  @Column()
  size: number;

  /**
   * Chemin de stockage du fichier
   * Stocké de manière sécurisée pour éviter les accès non autorisés
   */
  @Column()
  path: string;

  /**
   * Relation avec l'échéance associée à cette pièce jointe
   */
  @ManyToOne(() => Deadline, deadline => deadline.attachments)
  @JoinColumn({ name: 'deadlineId' })
  deadline: Deadline;

  /**
   * ID de l'échéance associée (clé étrangère)
   */
  @Column()
  deadlineId: string;

  /**
   * Relation avec l'utilisateur ayant ajouté la pièce jointe
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  /**
   * ID de l'utilisateur ayant ajouté la pièce jointe (clé étrangère)
   */
  @Column()
  uploaderId: string;

  /**
   * Date et heure d'ajout de la pièce jointe
   * Générée automatiquement
   */
  @CreateDateColumn()
  uploadedAt: Date;

  /**
   * Niveau de classification du document
   * Peut être nul
   */
  @Column({ nullable: true })
  classification: string;
}