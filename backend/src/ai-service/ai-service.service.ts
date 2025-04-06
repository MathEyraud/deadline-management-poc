/**
 * Service d'intégration avec le service IA Python
 * Gère la communication avec le service IA externe.
 * @module AiServiceService
 */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AiQueryDto } from './dto/ai-query.dto';
import { catchError, firstValueFrom } from 'rxjs';

/**
 * Service d'intégration avec l'IA
 * Fournit les méthodes pour communiquer avec le service IA Python
 */
@Injectable()
export class AiServiceService {
  /**
   * Constructeur du service
   * @param httpService Service HTTP pour les requêtes externes
   */
  constructor(private readonly httpService: HttpService) {}

  /**
   * Envoie une requête au service IA et récupère la réponse
   * @param aiQueryDto DTO contenant la requête et le contexte
   * @param userId ID de l'utilisateur qui fait la requête
   * @returns Promise contenant la réponse du service IA
   * @throws HttpException en cas d'erreur de communication
   */
  async query(aiQueryDto: AiQueryDto, userId: string) {
    // URL du service IA, depuis les variables d'environnement ou par défaut
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/chat';
    
    try {
      // Exécution de la requête HTTP POST vers le service IA
      const { data } = await firstValueFrom(
        this.httpService.post(aiServiceUrl, {
          query: aiQueryDto.query,         // Question ou instruction
          context: aiQueryDto.context || [], // Contexte ou historique (optionnel)
          userId: userId,                  // ID de l'utilisateur pour traçabilité
        }).pipe(
          // Gestion des erreurs HTTP
          catchError((error) => {
            throw new HttpException(
              `Erreur de communication avec le service IA: ${error.message}`,
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );
      
      return data; // Retourne les données de réponse
      
    } catch (error) {
      // En cas d'erreur, lance une exception avec un message approprié
      throw new HttpException(
        'Le service IA est indisponible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}