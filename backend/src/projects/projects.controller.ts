/**
 * Contrôleur pour la gestion des projets
 * Gère les points d'accès (endpoints) pour les opérations liées aux projets.
 * @module ProjectsController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Project, ProjectStatus } from './entities/project.entity';

/**
 * Contrôleur des projets
 * Gère toutes les opérations CRUD et les recherches sur les projets
 */
@ApiTags('projects') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection de toutes les routes avec JWT
@Controller('projects') // Préfixe de route
export class ProjectsController {
  /**
   * Constructeur du contrôleur
   * @param projectsService Service d'accès aux données des projets
   */
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Crée un nouveau projet
   * @param createProjectDto Données du projet à créer
   * @returns Le projet créé
   */
  @Post()
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès', type: Project })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  /**
   * Récupère tous les projets avec filtres optionnels
   * @param status Filtre optionnel par statut
   * @param managerId Filtre optionnel par ID de responsable
   * @param teamId Filtre optionnel par ID d'équipe
   * @returns Liste des projets correspondant aux critères
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
  @ApiQuery({ name: 'managerId', type: String, required: false })
  @ApiQuery({ name: 'teamId', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Liste des projets', type: [Project] })
  findAll(
    @Query('status') status?: ProjectStatus,
    @Query('managerId') managerId?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.projectsService.findAll({ status, managerId, teamId });
  }

  /**
   * Récupère un projet par son ID
   * @param id ID du projet à récupérer
   * @returns Le projet trouvé
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par son ID' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Projet trouvé', type: Project })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /**
   * Met à jour un projet existant
   * @param id ID du projet à mettre à jour
   * @param updateProjectDto Données de mise à jour
   * @returns Le projet mis à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour', type: Project })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  /**
   * Supprime un projet
   * @param id ID du projet à supprimer
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Projet supprimé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  /**
   * Récupère les projets gérés par un utilisateur spécifique
   * @param managerId ID du gestionnaire
   * @returns Liste des projets du gestionnaire
   */
  @Get('manager/:managerId')
  @ApiOperation({ summary: 'Récupérer les projets par gestionnaire' })
  @ApiParam({ name: 'managerId', description: 'ID du gestionnaire' })
  @ApiResponse({ status: 200, description: 'Liste des projets du gestionnaire', type: [Project] })
  findByManager(@Param('managerId') managerId: string) {
    return this.projectsService.findByManager(managerId);
  }

  /**
   * Récupère les projets associés à une équipe spécifique
   * @param teamId ID de l'équipe
   * @returns Liste des projets de l'équipe
   */
  @Get('team/:teamId')
  @ApiOperation({ summary: 'Récupérer les projets par équipe' })
  @ApiParam({ name: 'teamId', description: 'ID de l\'équipe' })
  @ApiResponse({ status: 200, description: 'Liste des projets de l\'équipe', type: [Project] })
  findByTeam(@Param('teamId') teamId: string) {
    return this.projectsService.findByTeam(teamId);
  }
}