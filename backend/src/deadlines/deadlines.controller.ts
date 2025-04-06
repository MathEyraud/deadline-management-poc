/**
 * Contrôleur gérant les points d'accès (endpoints) de l'API
 * pour les opérations liées aux échéances.
 * @module DeadlinesController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DeadlinesService } from './deadlines.service';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Deadline, DeadlinePriority, DeadlineStatus, DeadlineVisibility } from './entities/deadline.entity';

/**
 * Contrôleur des échéances
 * Gère toutes les opérations CRUD et les recherches sur les échéances
 */
@ApiTags('deadlines') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection de toutes les routes avec JWT
@Controller('deadlines') // Préfixe de route
export class DeadlinesController {
  /**
   * Constructeur du contrôleur
   * @param deadlinesService Service d'accès aux données des échéances
   */
  constructor(private readonly deadlinesService: DeadlinesService) {}

  /**
   * Crée une nouvelle échéance
   * @param createDeadlineDto Données de l'échéance à créer
   * @returns L'échéance créée
   */
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle échéance' })
  @ApiResponse({ status: 201, description: 'Échéance créée avec succès', type: Deadline })
  create(@Body() createDeadlineDto: CreateDeadlineDto) {
    return this.deadlinesService.create(createDeadlineDto);
  }

  /**
   * Récupère toutes les échéances avec filtres optionnels
   * @param status Filtre optionnel par statut
   * @param priority Filtre optionnel par priorité
   * @param visibility Filtre optionnel par visibilité
   * @param projectId Filtre optionnel par ID de projet
   * @param creatorId Filtre optionnel par ID de créateur
   * @returns Liste des échéances correspondant aux critères
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les échéances' })
  @ApiQuery({ name: 'status', enum: DeadlineStatus, required: false })
  @ApiQuery({ name: 'priority', enum: DeadlinePriority, required: false })
  @ApiQuery({ name: 'visibility', enum: DeadlineVisibility, required: false })
  @ApiQuery({ name: 'projectId', type: String, required: false })
  @ApiQuery({ name: 'creatorId', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Liste des échéances', type: [Deadline] })
  findAll(
    @Query('status') status?: DeadlineStatus,
    @Query('priority') priority?: DeadlinePriority,
    @Query('visibility') visibility?: DeadlineVisibility,
    @Query('projectId') projectId?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.deadlinesService.findAll({ status, priority, visibility, projectId, creatorId });
  }

  /**
   * Récupère une échéance par son ID
   * @param id ID de l'échéance à récupérer
   * @returns L'échéance trouvée
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une échéance par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'échéance' })
  @ApiResponse({ status: 200, description: 'Échéance trouvée', type: Deadline })
  @ApiResponse({ status: 404, description: 'Échéance non trouvée' })
  findOne(@Param('id') id: string) {
    return this.deadlinesService.findOne(id);
  }

  /**
   * Met à jour une échéance existante
   * @param id ID de l'échéance à mettre à jour
   * @param updateDeadlineDto Données de mise à jour
   * @returns L'échéance mise à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une échéance' })
  @ApiParam({ name: 'id', description: 'ID de l\'échéance' })
  @ApiResponse({ status: 200, description: 'Échéance mise à jour', type: Deadline })
  @ApiResponse({ status: 404, description: 'Échéance non trouvée' })
  update(@Param('id') id: string, @Body() updateDeadlineDto: UpdateDeadlineDto) {
    return this.deadlinesService.update(id, updateDeadlineDto);
  }

  /**
   * Supprime une échéance
   * @param id ID de l'échéance à supprimer
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une échéance' })
  @ApiParam({ name: 'id', description: 'ID de l\'échéance' })
  @ApiResponse({ status: 200, description: 'Échéance supprimée' })
  @ApiResponse({ status: 404, description: 'Échéance non trouvée' })
  remove(@Param('id') id: string) {
    return this.deadlinesService.remove(id);
  }

  /**
   * Récupère les échéances associées à un projet spécifique
   * @param projectId ID du projet
   * @returns Liste des échéances du projet
   */
  @Get('project/:projectId')
  @ApiOperation({ summary: 'Récupérer les échéances par projet' })
  @ApiParam({ name: 'projectId', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Liste des échéances par projet', type: [Deadline] })
  findByProject(@Param('projectId') projectId: string) {
    return this.deadlinesService.findByProject(projectId);
  }

  /**
   * Récupère les échéances créées par un utilisateur spécifique
   * @param userId ID de l'utilisateur
   * @returns Liste des échéances de l'utilisateur
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les échéances par utilisateur' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des échéances par utilisateur', type: [Deadline] })
  findByUser(@Param('userId') userId: string) {
    return this.deadlinesService.findByUser(userId);
  }
}