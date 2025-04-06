/**
 * Contrôleur pour la gestion des équipes
 * Gère les points d'accès (endpoints) pour les opérations liées aux équipes.
 * @module TeamsController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Team } from './entities/team.entity';

/**
 * Contrôleur des équipes
 * Gère toutes les opérations CRUD et les recherches sur les équipes
 */
@ApiTags('teams') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection de toutes les routes avec JWT
@Controller('teams') // Préfixe de route
export class TeamsController {
  /**
   * Constructeur du contrôleur
   * @param teamsService Service d'accès aux données des équipes
   */
  constructor(private readonly teamsService: TeamsService) {}

  /**
   * Crée une nouvelle équipe
   * @param createTeamDto Données de l'équipe à créer
   * @returns L'équipe créée
   */
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle équipe' })
  @ApiResponse({ status: 201, description: 'Équipe créée avec succès', type: Team })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  /**
   * Récupère toutes les équipes avec filtres optionnels
   * @param leaderId Filtre optionnel par ID de chef d'équipe
   * @param department Filtre optionnel par département
   * @returns Liste des équipes correspondant aux critères
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les équipes' })
  @ApiQuery({ name: 'leaderId', type: String, required: false })
  @ApiQuery({ name: 'department', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Liste des équipes', type: [Team] })
  findAll(
    @Query('leaderId') leaderId?: string,
    @Query('department') department?: string,
  ) {
    return this.teamsService.findAll({ leaderId, department });
  }

  /**
   * Récupère une équipe par son ID
   * @param id ID de l'équipe à récupérer
   * @returns L'équipe trouvée
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une équipe par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'équipe' })
  @ApiResponse({ status: 200, description: 'Équipe trouvée', type: Team })
  @ApiResponse({ status: 404, description: 'Équipe non trouvée' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  /**
   * Met à jour une équipe existante
   * @param id ID de l'équipe à mettre à jour
   * @param updateTeamDto Données de mise à jour
   * @returns L'équipe mise à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une équipe' })
  @ApiParam({ name: 'id', description: 'ID de l\'équipe' })
  @ApiResponse({ status: 200, description: 'Équipe mise à jour', type: Team })
  @ApiResponse({ status: 404, description: 'Équipe non trouvée' })
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  /**
   * Supprime une équipe
   * @param id ID de l'équipe à supprimer
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une équipe' })
  @ApiParam({ name: 'id', description: 'ID de l\'équipe' })
  @ApiResponse({ status: 200, description: 'Équipe supprimée' })
  @ApiResponse({ status: 404, description: 'Équipe non trouvée' })
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  /**
   * Ajoute un membre à une équipe
   * @param teamId ID de l'équipe
   * @param userId ID de l'utilisateur à ajouter
   * @returns L'équipe mise à jour
   */
  @Post(':teamId/members/:userId')
  @ApiOperation({ summary: 'Ajouter un membre à une équipe' })
  @ApiParam({ name: 'teamId', description: 'ID de l\'équipe' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur à ajouter' })
  @ApiResponse({ status: 200, description: 'Membre ajouté avec succès', type: Team })
  @ApiResponse({ status: 404, description: 'Équipe ou utilisateur non trouvé' })
  addMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.addMember(teamId, userId);
  }

  /**
   * Retire un membre d'une équipe
   * @param teamId ID de l'équipe
   * @param userId ID de l'utilisateur à retirer
   * @returns L'équipe mise à jour
   */
  @Delete(':teamId/members/:userId')
  @ApiOperation({ summary: 'Retirer un membre d\'une équipe' })
  @ApiParam({ name: 'teamId', description: 'ID de l\'équipe' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur à retirer' })
  @ApiResponse({ status: 200, description: 'Membre retiré avec succès', type: Team })
  @ApiResponse({ status: 404, description: 'Équipe non trouvée' })
  removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    return this.teamsService.removeMember(teamId, userId);
  }
}