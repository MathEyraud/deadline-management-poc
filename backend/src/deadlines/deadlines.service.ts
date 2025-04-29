/**
 * Service pour la gestion des échéances
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux échéances.
 * @module DeadlinesService
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Deadline, DeadlinePriority, DeadlineStatus, DeadlineVisibility } from './entities/deadline.entity';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';
import { User, UserRole } from 'src/users/entities/user.entity';

/**
 * Service pour la gestion des échéances
 * Gère la logique métier et les opérations CRUD sur les échéances
 */
@Injectable()
export class DeadlinesService {
  /**
   * Constructeur du service
   * @param deadlinesRepository Repository TypeORM pour les échéances
   */
  constructor(
    @InjectRepository(Deadline)
    private deadlinesRepository: Repository<Deadline>,
  ) {}

  /**
   * Crée une nouvelle échéance
   * @param createDeadlineDto Données de l'échéance à créer
   * @returns Promise contenant l'échéance créée
   */
  async create(createDeadlineDto: CreateDeadlineDto): Promise<Deadline> {
    // Création d'une nouvelle instance avec les données fournies
    const deadline = this.deadlinesRepository.create(createDeadlineDto);
    
    // Sauvegarde dans la base de données
    return this.deadlinesRepository.save(deadline);
  }

  /**
   * Récupère toutes les échéances avec filtres optionnels
   * @param filters Objet contenant les filtres à appliquer
   * @returns Promise contenant la liste des échéances correspondant aux critères
   */
  async findAll(filters: {
    status?: DeadlineStatus;
    priority?: DeadlinePriority;
    visibility?: DeadlineVisibility;
    projectId?: string;
    creatorId?: string;
  }): Promise<Deadline[]> {
    // Création d'un query builder pour construire la requête de manière dynamique
    const query = this.deadlinesRepository.createQueryBuilder('deadline');
    
    // Ajout des conditions de filtre si elles sont présentes
    if (filters.status) {
      query.andWhere('deadline.status = :status', { status: filters.status });
    }
    
    if (filters.priority) {
      query.andWhere('deadline.priority = :priority', { priority: filters.priority });
    }
    
    if (filters.visibility) {
      query.andWhere('deadline.visibility = :visibility', { visibility: filters.visibility });
    }
    
    if (filters.projectId) {
      query.andWhere('deadline.projectId = :projectId', { projectId: filters.projectId });
    }
    
    if (filters.creatorId) {
      query.andWhere('deadline.creatorId = :creatorId', { creatorId: filters.creatorId });
    }
    
    // Chargement des relations pour obtenir des données complètes
    query.leftJoinAndSelect('deadline.creator', 'creator');
    query.leftJoinAndSelect('deadline.project', 'project');
    
    // Exécution de la requête
    return query.getMany();
  }

  /**
   * Récupère une échéance spécifique par son ID
   * @param id ID de l'échéance à récupérer
   * @returns Promise contenant l'échéance trouvée
   * @throws NotFoundException si l'échéance n'existe pas
   */
  async findOne(id: string): Promise<Deadline> {
    // Recherche de l'échéance avec ses relations
    const deadline = await this.deadlinesRepository.findOne({
      where: { id },
      relations: ['creator', 'project', 'comments', 'attachments'],
    });
    
    // Si l'échéance n'existe pas, lever une exception
    if (!deadline) {
      throw new NotFoundException(`Échéance avec ID "${id}" non trouvée`);
    }
    
    return deadline;
  }

  /**
   * Met à jour une échéance existante
   * @param id ID de l'échéance à mettre à jour
   * @param updateDeadlineDto Données de mise à jour
   * @returns Promise contenant l'échéance mise à jour
   */
  async update(id: string, updateDeadlineDto: UpdateDeadlineDto): Promise<Deadline> {
    // Récupération de l'échéance existante
    const deadline = await this.findOne(id);
    
    // Mise à jour uniquement des champs fournis
    Object.assign(deadline, updateDeadlineDto);
    
    // Sauvegarde des modifications
    return this.deadlinesRepository.save(deadline);
  }

  /**
   * Supprime une échéance
   * @param id ID de l'échéance à supprimer
   */
  async remove(id: string): Promise<void> {
    // Récupération de l'échéance à supprimer
    const deadline = await this.findOne(id);
    
    // Suppression de l'échéance
    await this.deadlinesRepository.remove(deadline);
  }

  /**
   * Récupère les échéances associées à un projet spécifique
   * @param projectId ID du projet
   * @returns Promise contenant la liste des échéances du projet
   */
  async findByProject(projectId: string): Promise<Deadline[]> {
    return this.deadlinesRepository.find({
      where: { projectId },
      relations: ['creator'], // Inclut les informations sur le créateur
    });
  }

  /**
   * Récupère les échéances créées par un utilisateur spécifique
   * @param userId ID de l'utilisateur
   * @returns Promise contenant la liste des échéances de l'utilisateur
   */
  async findByUser(userId: string): Promise<Deadline[]> {
    return this.deadlinesRepository.find({
      where: { creatorId: userId },
      relations: ['project'], // Inclut les informations sur le projet
    });
  }

  /**
   * Trouve des échéances similaires à une échéance donnée
   * Utilisé pour l'analyse prédictive
   * @param deadline Échéance de référence
   * @returns Promise contenant la liste des échéances similaires
   */
  async findSimilar(deadline: Deadline): Promise<Deadline[]> {
    // Création d'un query builder pour construire la requête
    const query = this.deadlinesRepository.createQueryBuilder('deadline');

    // Les échéances similaires sont celles qui partagent le même projet
    if (deadline.projectId) {
      query.andWhere('deadline.projectId = :projectId', { projectId: deadline.projectId });
    }

    // Ou celles qui ont la même priorité
    else {
      query.andWhere('deadline.priority = :priority', { priority: deadline.priority });
    }

    // Exclure l'échéance elle-même
    query.andWhere('deadline.id != :id', { id: deadline.id });

    // Limiter aux échéances terminées pour l'analyse prédictive
    query.andWhere('deadline.status IN (:...statuses)', { 
      statuses: [DeadlineStatus.COMPLETED, DeadlineStatus.CANCELLED] 
    });

    // Tri par date de création (du plus récent au plus ancien)
    query.orderBy('deadline.createdAt', 'DESC');

    // Limiter le nombre de résultats pour des performances optimales
    query.limit(10);

    // Chargement des relations pertinentes
    query.leftJoinAndSelect('deadline.creator', 'creator');
    query.leftJoinAndSelect('deadline.project', 'project');

    // Exécution de la requête
    return query.getMany();
  }

  /**
   * Récupère toutes les échéances auxquelles un utilisateur a accès
   * selon les règles de visibilité, l'appartenance aux projets/équipes
   * et le rôle de l'utilisateur.
   * @param userId ID de l'utilisateur
   * @returns Promise contenant la liste des échéances accessibles
   */
  async getAccessibleDeadlines(userId: string): Promise<Deadline[]> {
    // Récupérer l'utilisateur avec ses informations
    const userRepository = this.deadlinesRepository.manager.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new NotFoundException(`Utilisateur avec ID "${userId}" non trouvé`);
    }
  
    // Si l'utilisateur est un administrateur, accès total
    if (user.role === UserRole.ADMIN) {
      return this.deadlinesRepository.find({
        relations: ['creator', 'project', 'comments', 'attachments'],
      });
    }
  
    // Construction d'une requête optimisée pour récupérer les échéances accessibles
    const query = this.deadlinesRepository.createQueryBuilder('deadline')
      .leftJoinAndSelect('deadline.creator', 'creator')
      .leftJoinAndSelect('deadline.project', 'project')
      .leftJoinAndSelect('project.team', 'team')
      .where(new Brackets(qb => {
        // Échéances créées par l'utilisateur
        qb.where('deadline.creatorId = :userId', { userId });
        
        // Échéances visibles pour l'organisation entière
        qb.orWhere('deadline.visibility = :orgVisibility', 
                  { orgVisibility: DeadlineVisibility.ORGANIZATION });
        
        // Échéances visibles au niveau département où l'utilisateur appartient au même département
        qb.orWhere('deadline.visibility = :deptVisibility AND creator.department = :userDepartment',
                  { deptVisibility: DeadlineVisibility.DEPARTMENT, userDepartment: user.department });
        
        // Requête pour les équipes dont l'utilisateur est membre
        const teamSubQuery = this.deadlinesRepository.manager
          .getRepository('team_members')
          .createQueryBuilder('tm')
          .select('tm.teamId')
          .where('tm.userId = :userId', { userId });
        
        // Échéances visibles au niveau équipe où l'utilisateur est membre ou chef d'équipe
        qb.orWhere(`deadline.visibility = :teamVisibility AND 
                    (team.id IN (${teamSubQuery.getQuery()}) OR team.leaderId = :userId)`,
                  { teamVisibility: DeadlineVisibility.TEAM, userId });
        
        // Échéances des projets dont l'utilisateur est responsable
        qb.orWhere('project.managerId = :userId', { userId });
      }));
  
    // Paramètres pour la sous-requête des équipes
    query.setParameter('userId', userId);
    
    return query.getMany();
  }
}