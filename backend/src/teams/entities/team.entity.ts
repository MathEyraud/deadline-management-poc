/**
 * Modèle de données pour les équipes
 * Définit la structure de la table 'teams' dans la base de données
 * et les relations avec les autres entités.
 * @module TeamEntity
 */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

/**
 * Entité représentant une équipe dans le système
 * @entity Team
 */
@Entity('teams')
export class Team {
  /**
   * Identifiant unique de l'équipe (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nom de l'équipe
   * Limité à 100 caractères
   */
  @Column({ length: 100 })
  name: string;

  /**
   * Description détaillée de l'équipe
   * Peut être nulle
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Relation avec l'utilisateur chef d'équipe
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'leaderId' })
  leader: User;

  /**
   * ID du chef d'équipe (clé étrangère)
   */
  @Column()
  leaderId: string;

  /**
   * Relation avec les membres de l'équipe
   */
  @ManyToMany(() => User)
  @JoinTable({
    name: 'team_members',
    joinColumn: { name: 'teamId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  members: User[];

  /**
   * Département auquel l'équipe appartient
   * Peut être nul
   */
  @Column({ nullable: true })
  department: string;

  /**
   * Relation avec les projets associés à cette équipe
   */
  @OneToMany(() => Project, project => project.team)
  projects: Project[];
}