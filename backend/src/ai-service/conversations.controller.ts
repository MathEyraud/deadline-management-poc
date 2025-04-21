/**
 * Contrôleur pour la gestion des conversations IA
 * Gère les points d'accès (endpoints) pour les opérations liées aux conversations.
 * @module ConversationsController
 */
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, Query, ParseBoolPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto, UpdateConversationDto, AddMessageDto } from './dto/conversation.dto';
import { AiConversation } from './entities/conversation.entity';

/**
 * Contrôleur pour la gestion des conversations IA
 * Gère les endpoints API pour les opérations CRUD sur les conversations
 */
@ApiTags('conversations') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection de toutes les routes avec JWT
@Controller('conversations') // Préfixe de route
export class ConversationsController {
  /**
   * Constructeur du contrôleur
   * @param conversationsService Service de gestion des conversations
   */
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * Crée une nouvelle conversation
   * @param createConversationDto Données de la conversation
   * @param req Objet requête contenant les informations d'authentification
   * @returns La conversation créée
   */
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle conversation IA' })
  @ApiResponse({ status: 201, description: 'Conversation créée avec succès' })
  async create(@Body() createConversationDto: CreateConversationDto, @Req() req) {
    // Utiliser l'ID de l'utilisateur extrait du token JWT
    createConversationDto.userId = req.user.id;
    return this.conversationsService.create(createConversationDto);
  }

  /**
   * Récupère toutes les conversations de l'utilisateur authentifié
   * @param req Objet requête contenant les informations d'authentification
   * @param activeOnly Filtre pour ne récupérer que les conversations actives
   * @returns Liste des conversations
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer les conversations de l\'utilisateur' })
  @ApiQuery({ 
    name: 'activeOnly', 
    required: false, 
    type: Boolean,
    description: 'Filtrer pour ne récupérer que les conversations actives'
  })
  @ApiResponse({ status: 200, description: 'Liste des conversations récupérée' })
  async findByUser(@Req() req, @Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly: boolean = true) {
    const userId = req.user.id;
    return this.conversationsService.findByUser(userId, activeOnly);
  }

  /**
   * Récupère une conversation par son ID
   * @param id ID de la conversation
   * @returns La conversation
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une conversation par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ status: 200, description: 'Conversation trouvée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  /**
   * Met à jour une conversation
   * @param id ID de la conversation
   * @param updateConversationDto Données de mise à jour
   * @returns La conversation mise à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ status: 200, description: 'Conversation mise à jour' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async update(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(id, updateConversationDto);
  }

  /**
   * Archive une conversation (la marque comme inactive)
   * @param id ID de la conversation
   * @returns La conversation archivée
   */
  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archiver une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ status: 200, description: 'Conversation archivée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async archive(@Param('id') id: string) {
    return this.conversationsService.archive(id);
  }

  /**
   * Ajoute un message à une conversation
   * @param id ID de la conversation
   * @param addMessageDto Données du message
   * @returns La conversation mise à jour
   */
  @Post(':id/messages')
  @ApiOperation({ summary: 'Ajouter un message à une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ status: 200, description: 'Message ajouté' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async addMessage(@Param('id') id: string, @Body() addMessageDto: AddMessageDto) {
    return this.conversationsService.addMessage(id, addMessageDto);
  }

  /**
   * Récupère tous les messages d'une conversation
   * @param id ID de la conversation
   * @returns Liste des messages
   */
  @Get(':id/messages')
  @ApiOperation({ summary: 'Récupérer tous les messages d\'une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ status: 200, description: 'Messages récupérés' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async getMessages(@Param('id') id: string) {
    return this.conversationsService.getMessages(id);
  }

  /**
   * Supprime une conversation
   * @param id ID de la conversation
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ status: 200, description: 'Conversation supprimée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async remove(@Param('id') id: string) {
    await this.conversationsService.remove(id);
    return { message: 'Conversation supprimée avec succès' };
  }
}