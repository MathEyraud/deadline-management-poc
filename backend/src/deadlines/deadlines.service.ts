/**
 * Service pour la gestion des échéances
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux échéances.
 * @module DeadlinesService
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deadline, DeadlinePriority, DeadlineStatus, DeadlineVisibility } from './entities/deadline.entity';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';

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
}