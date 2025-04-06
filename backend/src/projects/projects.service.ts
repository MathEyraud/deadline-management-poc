/**
 * Service pour la gestion des projets
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux projets.
 * @module ProjectsService
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * Service pour la gestion des projets
 * Gère la logique métier et les opérations CRUD sur les projets
 */
@Injectable()
export class ProjectsService {
  /**
   * Constructeur du service
   * @param projectsRepository Repository TypeORM pour les projets
   */
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  /**
   * Crée un nouveau projet
   * @param createProjectDto Données du projet à créer
   * @returns Promise contenant le projet créé
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Création d'une nouvelle instance avec les données fournies
    const project = this.projectsRepository.create(createProjectDto);
    
    // Sauvegarde dans la base de données
    return this.projectsRepository.save(project);
  }

  /**
   * Récupère tous les projets avec filtres optionnels
   * @param filters Objet contenant les filtres à appliquer
   * @returns Promise contenant la liste des projets correspondant aux critères
   */
  async findAll(filters?: {
    status?: ProjectStatus;
    managerId?: string;
    teamId?: string;
  }): Promise<Project[]> {
    // Création d'un query builder pour construire la requête de manière dynamique
    const query = this.projectsRepository.createQueryBuilder('project');
    
    // Ajout des conditions de filtre si elles sont présentes
    if (filters) {
      if (filters.status) {
        query.andWhere('project.status = :status', { status: filters.status });
      }
      
      if (filters.managerId) {
        query.andWhere('project.managerId = :managerId', { managerId: filters.managerId });
      }
      
      if (filters.teamId) {
        query.andWhere('project.teamId = :teamId', { teamId: filters.teamId });
      }
    }
    
    // Chargement des relations pour obtenir des données complètes
    query.leftJoinAndSelect('project.manager', 'manager');
    query.leftJoinAndSelect('project.team', 'team');
    
    // Exécution de la requête
    return query.getMany();
  }

  /**
   * Récupère un projet spécifique par son ID
   * @param id ID du projet à récupérer
   * @returns Promise contenant le projet trouvé
   * @throws NotFoundException si le projet n'existe pas
   */
  async findOne(id: string): Promise<Project> {
    // Recherche du projet avec ses relations
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['manager', 'team', 'deadlines'],
    });
    
    // Si le projet n'existe pas, lever une exception
    if (!project) {
      throw new NotFoundException(`Projet avec ID "${id}" non trouvé`);
    }
    
    return project;
  }

  /**
   * Met à jour un projet existant
   * @param id ID du projet à mettre à jour
   * @param updateProjectDto Données de mise à jour
   * @returns Promise contenant le projet mis à jour
   */
  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    // Récupération du projet existant
    const project = await this.findOne(id);
    
    // Mise à jour uniquement des champs fournis
    Object.assign(project, updateProjectDto);
    
    // Sauvegarde des modifications
    return this.projectsRepository.save(project);
  }

  /**
   * Supprime un projet
   * @param id ID du projet à supprimer
   */
  async remove(id: string): Promise<void> {
    // Récupération du projet à supprimer
    const project = await this.findOne(id);
    
    // Suppression du projet
    await this.projectsRepository.remove(project);
  }

  /**
   * Récupère les projets gérés par un utilisateur spécifique
   * @param managerId ID du gestionnaire
   * @returns Promise contenant la liste des projets du gestionnaire
   */
  async findByManager(managerId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { managerId },
      relations: ['team'],
    });
  }

  /**
   * Récupère les projets associés à une équipe spécifique
   * @param teamId ID de l'équipe
   * @returns Promise contenant la liste des projets de l'équipe
   */
  async findByTeam(teamId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { teamId },
      relations: ['manager'],
    });
  }
}