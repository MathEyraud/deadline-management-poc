/**
 * Contrôleur pour l'intégration avec le service IA
 * Gère les points d'accès (endpoints) pour les interactions avec l'IA.
 * @module AiServiceController
 */
import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiServiceService } from './ai-service.service';
import { AiQueryDto } from './dto/ai-query.dto';

/**
 * Contrôleur pour l'intégration avec le service IA
 * Gère les points d'accès (endpoints) pour les interactions avec l'IA.
 */
@ApiTags('ai')
@Controller('ai')
export class AiServiceController {
  /**
   * Constructeur du contrôleur
   * @param aiServiceService Service d'intégration avec l'IA
   */
  constructor(private readonly aiServiceService: AiServiceService) {}

  /**
   * Vérifie l'état du service IA
   * @returns Statut du service IA
   */
  @Get('health')
  @ApiOperation({ summary: 'Vérifier l\'état du service IA' })
  @ApiResponse({ status: 200, description: 'Le service IA est disponible' })
  @ApiResponse({ status: 503, description: 'Le service IA est indisponible' })
  async healthCheck() {
    return this.aiServiceService.healthCheck();
  }

  /**
   * Envoie une requête au service IA
   * @param req Objet requête contenant l'utilisateur authentifié
   * @param aiQueryDto DTO contenant la requête et le contexte
   * @returns Réponse du service IA
   */
  @Post('query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Envoyer une requête au service IA' })
  @ApiResponse({ status: 200, description: 'Réponse IA générée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 503, description: 'Service IA indisponible' })
  async query(@Req() req, @Body() aiQueryDto: AiQueryDto) {
    // Récupération de l'ID utilisateur depuis le token JWT (req.user)
    const userId = req.user.id;
    return this.aiServiceService.query(userId, aiQueryDto);
  }

  /**
   * Réalise une analyse prédictive d'une échéance
   * @param id ID de l'échéance à analyser
   * @returns Analyse prédictive de l'échéance
   */
  @Get('predict/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyse prédictive d\'une échéance' })
  @ApiParam({ name: 'id', description: 'ID de l\'échéance à analyser' })
  @ApiResponse({ status: 200, description: 'Analyse prédictive générée avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Échéance non trouvée' })
  @ApiResponse({ status: 503, description: 'Service IA indisponible' })
  async predictDeadline(@Param('id') id: string) {
    return this.aiServiceService.predictDeadlineCompletion(id);
  }
}