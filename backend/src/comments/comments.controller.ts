/**
 * Contrôleur pour la gestion des commentaires
 * Gère les points d'accès (endpoints) pour les opérations liées aux commentaires.
 * @module CommentsController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Comment, CommentVisibility } from './entities/comment.entity';

/**
 * Contrôleur des commentaires
 * Gère toutes les opérations CRUD et les recherches sur les commentaires
 */
@ApiTags('comments') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection de toutes les routes avec JWT
@Controller('comments') // Préfixe de route
export class CommentsController {
  /**
   * Constructeur du contrôleur
   * @param commentsService Service d'accès aux données des commentaires
   */
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Crée un nouveau commentaire
   * @param createCommentDto Données du commentaire à créer
   * @returns Le commentaire créé
   */
  @Post()
  @ApiOperation({ summary: 'Créer un nouveau commentaire' })
  @ApiResponse({ status: 201, description: 'Commentaire créé avec succès', type: Comment })
  @ApiResponse({ status: 404, description: 'Échéance non trouvée' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  /**
   * Récupère tous les commentaires avec filtres optionnels
   * @param authorId Filtre optionnel par ID d'auteur
   * @param deadlineId Filtre optionnel par ID d'échéance
   * @param visibility Filtre optionnel par visibilité
   * @returns Liste des commentaires correspondant aux critères
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les commentaires' })
  @ApiQuery({ name: 'authorId', type: String, required: false })
  @ApiQuery({ name: 'deadlineId', type: String, required: false })
  @ApiQuery({ name: 'visibility', enum: CommentVisibility, required: false })
  @ApiResponse({ status: 200, description: 'Liste des commentaires', type: [Comment] })
  findAll(
    @Query('authorId') authorId?: string,
    @Query('deadlineId') deadlineId?: string,
    @Query('visibility') visibility?: CommentVisibility,
  ) {
    return this.commentsService.findAll({ authorId, deadlineId, visibility });
  }

  /**
   * Récupère un commentaire par son ID
   * @param id ID du commentaire à récupérer
   * @returns Le commentaire trouvé
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un commentaire par son ID' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire trouvé', type: Comment })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  /**
   * Met à jour un commentaire existant
   * @param id ID du commentaire à mettre à jour
   * @param updateCommentDto Données de mise à jour
   * @param req Objet requête contenant les informations d'authentification
   * @returns Le commentaire mis à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire mis à jour', type: Comment })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ) {
    // Récupération de l'ID utilisateur depuis le token JWT
    const currentUserId = req.user.id;
    return this.commentsService.update(id, updateCommentDto, currentUserId);
  }

  /**
   * Supprime un commentaire
   * @param id ID du commentaire à supprimer
   * @param req Objet requête contenant les informations d'authentification
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  @ApiParam({ name: 'id', description: 'ID du commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire supprimé' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé' })
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    // Récupération de l'ID utilisateur depuis le token JWT
    const currentUserId = req.user.id;
    return this.commentsService.remove(id, currentUserId);
  }

  /**
   * Récupère tous les commentaires d'une échéance spécifique
   * @param deadlineId ID de l'échéance
   * @returns Liste des commentaires de l'échéance
   */
    @Get('deadline/:deadlineId')
    @ApiOperation({ summary: 'Récupérer les commentaires par échéance' })
    @ApiParam({ name: 'deadlineId', description: 'ID de l\'échéance' })
    @ApiResponse({ status: 200, description: 'Liste des commentaires de l\'échéance', type: [Comment] })
    findByDeadline(@Param('deadlineId') deadlineId: string) {
        return this.commentsService.findByDeadline(deadlineId);
    }

    /**
     * Récupère tous les commentaires d'un utilisateur spécifique
     * @param authorId ID de l'utilisateur
     * @returns Liste des commentaires de l'utilisateur
     */
    @Get('author/:authorId')
    @ApiOperation({ summary: 'Récupérer les commentaires par auteur' })
    @ApiParam({ name: 'authorId', description: 'ID de l\'auteur' })
    @ApiResponse({ status: 200, description: 'Liste des commentaires de l\'auteur', type: [Comment] })
    findByAuthor(@Param('authorId') authorId: string) {
        return this.commentsService.findByAuthor(authorId);
    }
}