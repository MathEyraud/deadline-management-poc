/**
 * Modèle de données pour l'historique des conversations IA
 * Définit la structure de la table 'ai_conversations' dans la base de données
 * et les relations avec les autres entités.
 * @module ConversationEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Interface pour les messages individuels dans une conversation
 */
export interface ConversationMessage {
  /**
   * Rôle du message (user ou assistant)
   */
  role: 'user' | 'assistant';
  
  /**
   * Contenu du message
   */
  content: string;
  
  /**
   * Horodatage du message
   */
  timestamp: Date;
}

/**
 * Entité représentant une conversation IA dans le système
 * @entity AiConversation
 */
@Entity('ai_conversations')
export class AiConversation {
  /**
   * Identifiant unique de la conversation (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Titre de la conversation (généré automatiquement ou défini par l'utilisateur)
   * Limité à 200 caractères
   */
  @Column({ length: 200 })
  title: string;

  /**
   * Relation avec l'utilisateur participant à la conversation
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * ID de l'utilisateur participant (clé étrangère)
   */
  @Column()
  userId: string;

  /**
   * Tableau des messages dans la conversation
   * Stocké au format JSON
   */
  @Column({ type: 'json' })
  messages: ConversationMessage[];

  /**
   * Date et heure de création de la conversation
   * Générée automatiquement
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Date et heure de la dernière mise à jour
   * Mise à jour automatiquement
   */
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Marqueur indiquant si la conversation est active ou archivée
   */
  @Column({ default: true })
  isActive: boolean;
}