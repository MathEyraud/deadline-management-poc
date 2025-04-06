/**
 * Contrôleur pour l'intégration avec le service IA
 * Gère les points d'accès (endpoints) pour les interactions avec l'IA.
 * @module AiServiceController
 */
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { AiQueryDto } from './dto/ai-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Contrôleur pour les interactions avec le service IA
 * Gère les requêtes vers l'IA conversationnelle
 */
@ApiTags('ai-service') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth()       // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection des routes avec JWT
@Controller('ai')      // Préfixe de route
export class AiServiceController {
  /**
   * Constructeur du contrôleur
   * @param aiServiceService Service d'intégration avec l'IA
   */
  constructor(private readonly aiServiceService: AiServiceService) {}

  /**
   * Endpoint pour envoyer une requête à l'IA
   * @param aiQueryDto DTO contenant la requête et le contexte
   * @param req Objet requête contenant les informations d'authentification
   * @returns Réponse du service IA
   */
  @Post('query')
  @ApiOperation({ summary: 'Envoyer une requête au service IA' })
  @ApiResponse({ status: 200, description: 'Réponse du modèle IA' })
  @ApiResponse({ status: 503, description: 'Service IA indisponible' })
  async query(@Body() aiQueryDto: AiQueryDto, @Req() req) {
    // Récupération de l'ID utilisateur depuis le token JWT (req.user)
    const userId = req.user.id;
    // Transmission de la requête au service IA
    return this.aiServiceService.query(aiQueryDto, userId);
  }
}