/**
 * Service pour la gestion des équipes
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux équipes.
 * @module TeamsService
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

/**
 * Service pour la gestion des équipes
 * Gère la logique métier et les opérations CRUD sur les équipes
 */
@Injectable()
export class TeamsService {
  /**
   * Constructeur du service
   * @param teamsRepository Repository TypeORM pour les équipes
   * @param usersRepository Repository TypeORM pour les utilisateurs (pour gérer les membres)
   */
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crée une nouvelle équipe
   * @param createTeamDto Données de l'équipe à créer
   * @returns Promise contenant l'équipe créée
   */
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // Récupération des membres de l'équipe
    const members = await this.usersRepository.findByIds(createTeamDto.memberIds);
    
    // Création d'une nouvelle instance avec les données fournies
    const team = this.teamsRepository.create({
      name: createTeamDto.name,
      description: createTeamDto.description,
      leaderId: createTeamDto.leaderId,
      department: createTeamDto.department,
      members: members,
    });
    
    // Sauvegarde dans la base de données
    return this.teamsRepository.save(team);
  }

  /**
   * Récupère toutes les équipes avec filtres optionnels
   * @param filters Objet contenant les filtres à appliquer
   * @returns Promise contenant la liste des équipes correspondant aux critères
   */
  async findAll(filters?: {
    leaderId?: string;
    department?: string;
  }): Promise<Team[]> {
    // Création d'un query builder pour construire la requête de manière dynamique
    const query = this.teamsRepository.createQueryBuilder('team');
    
    // Ajout des conditions de filtre si elles sont présentes
    if (filters) {
      if (filters.leaderId) {
        query.andWhere('team.leaderId = :leaderId', { leaderId: filters.leaderId });
      }
      
      if (filters.department) {
        query.andWhere('team.department = :department', { department: filters.department });
      }
    }
    
    // Chargement des relations pour obtenir des données complètes
    query.leftJoinAndSelect('team.leader', 'leader');
    query.leftJoinAndSelect('team.members', 'members');
    query.leftJoinAndSelect('team.projects', 'projects');
    
    // Exécution de la requête
    return query.getMany();
  }

  /**
   * Récupère une équipe spécifique par son ID
   * @param id ID de l'équipe à récupérer
   * @returns Promise contenant l'équipe trouvée
   * @throws NotFoundException si l'équipe n'existe pas
   */
  async findOne(id: string): Promise<Team> {
    // Recherche de l'équipe avec ses relations
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['leader', 'members', 'projects'],
    });
    
    // Si l'équipe n'existe pas, lever une exception
    if (!team) {
      throw new NotFoundException(`Équipe avec ID "${id}" non trouvée`);
    }
    
    return team;
  }

  /**
   * Met à jour une équipe existante
   * @param id ID de l'équipe à mettre à jour
   * @param updateTeamDto Données de mise à jour
   * @returns Promise contenant l'équipe mise à jour
   */
  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    // Récupération de l'équipe existante
    const team = await this.findOne(id);
    
    // Si des IDs de membres sont fournis, récupérer les membres correspondants
    if (updateTeamDto.memberIds) {
      const members = await this.usersRepository.findByIds(updateTeamDto.memberIds);
      team.members = members;
    }
    
    // Mise à jour des autres champs fournis
    if (updateTeamDto.name) team.name = updateTeamDto.name;
    if (updateTeamDto.description !== undefined) team.description = updateTeamDto.description;
    if (updateTeamDto.leaderId) team.leaderId = updateTeamDto.leaderId;
    if (updateTeamDto.department !== undefined) team.department = updateTeamDto.department;
    
    // Sauvegarde des modifications
    return this.teamsRepository.save(team);
  }

  /**
   * Supprime une équipe
   * @param id ID de l'équipe à supprimer
   */
  async remove(id: string): Promise<void> {
    // Récupération de l'équipe à supprimer
    const team = await this.findOne(id);
    
    // Suppression de l'équipe
    await this.teamsRepository.remove(team);
  }

  /**
   * Ajoute un membre à une équipe
   * @param teamId ID de l'équipe
   * @param userId ID de l'utilisateur à ajouter
   * @returns Promise contenant l'équipe mise à jour
   */
  async addMember(teamId: string, userId: string): Promise<Team> {
    // Récupération de l'équipe
    const team = await this.findOne(teamId);
    
    // Récupération de l'utilisateur
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID "${userId}" non trouvé`);
    }
    
    // Vérifier si l'utilisateur est déjà membre de l'équipe
    const isMember = team.members.some(member => member.id === userId);
    
    // Si l'utilisateur n'est pas déjà membre, l'ajouter
    if (!isMember) {
      team.members.push(user);
      await this.teamsRepository.save(team);
    }
    
    return team;
  }

  /**
   * Retire un membre d'une équipe
   * @param teamId ID de l'équipe
   * @param userId ID de l'utilisateur à retirer
   * @returns Promise contenant l'équipe mise à jour
   */
  async removeMember(teamId: string, userId: string): Promise<Team> {
    // Récupération de l'équipe
    const team = await this.findOne(teamId);
    
    // Filtrer les membres pour exclure l'utilisateur à retirer
    team.members = team.members.filter(member => member.id !== userId);
    
    // Sauvegarder les modifications
    await this.teamsRepository.save(team);
    
    return team;
  }
}