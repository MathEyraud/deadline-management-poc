/**
 * Service d'intégration avec le service IA Python
 * Gère la communication avec le service IA externe.
 * @module AiServiceService
 */
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AiQueryDto } from './dto/ai-query.dto';
import { DeadlinesService } from '../deadlines/deadlines.service';
import { UsersService } from '../users/users.service';
import { Deadline } from '../deadlines/entities/deadline.entity'; // Importez explicitement le type Deadline

/**
 * Service d'intégration avec le service IA Python
 * Gère la communication et le traitement des requêtes vers l'IA
 */
@Injectable()
export class AiServiceService {
  private readonly logger = new Logger(AiServiceService.name);
  private readonly serviceUrl: string;

  /**
   * Constructeur du service
   * @param httpService Service HTTP pour les requêtes externes
   * @param configService Service de configuration
   * @param deadlinesService Service pour accéder aux échéances
   * @param usersService Service pour accéder aux utilisateurs
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly deadlinesService: DeadlinesService,
    private readonly usersService: UsersService,
  ) {
    this.serviceUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
    this.logger.log(`Service IA configuré avec l'URL: ${this.serviceUrl}`);
  }

  /**
   * Vérifie l'état du service IA
   * @returns Statut du service IA
   * @throws HttpException si le service est indisponible
   */
  async healthCheck() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.serviceUrl}/health`).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error(`Erreur lors du health check du service IA: ${error.message}`);
            throw new HttpException(
              'Service IA indisponible',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );
      return { status: 'ok', message: 'Service IA disponible', ...response };
    } catch (error) {
      this.logger.error(`Erreur lors du health check: ${error.message}`);
      throw new HttpException(
        'Service IA indisponible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Traite une requête utilisateur et obtient une réponse du service IA
   * @param userId ID de l'utilisateur qui fait la requête
   * @param aiQueryDto DTO contenant la requête et le contexte
   * @returns Réponse du service IA
   * @throws HttpException en cas d'erreur
   */
  async query(userId: string, aiQueryDto: AiQueryDto) {
    try {
      // Récupérer les échéances de l'utilisateur si nécessaire
      let deadlines: Deadline[] = [];
      if (aiQueryDto.includeDeadlines) {
        deadlines = await this.deadlinesService.findByUser(userId);
        this.logger.debug(`Récupération de ${deadlines.length} échéances pour l'utilisateur ${userId}`);
      }

      // Récupérer l'utilisateur
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }

      // Préparer la requête pour le service IA
      const requestData = {
        query: aiQueryDto.query,
        context: aiQueryDto.context || [],
        deadlines: deadlines.map(deadline => ({
          id: deadline.id,
          title: deadline.title,
          description: deadline.description,
          deadlineDate: deadline.deadlineDate,
          status: deadline.status,
          priority: deadline.priority,
          projectId: deadline.projectId,
          projectName: deadline.project?.name,
        })),
        user_id: userId,
        user_info: {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          department: user.department,
        }
      };

      // Envoyer la requête au service IA
      const response = await lastValueFrom(
        this.httpService.post(`${this.serviceUrl}/chat`, requestData).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error(`Erreur lors de la requête au service IA: ${error.message}`);
            throw new HttpException(
              `Erreur du service IA: ${error.response?.data?.detail || error.message}`,
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      // Enregistrer la conversation dans l'historique si nécessaire
      if (aiQueryDto.saveToHistory) {
        // Cette fonctionnalité sera implémentée ultérieurement
        // Possibilité de créer une table ConversationHistory dans la base de données
        this.logger.debug('Sauvegarde de la conversation dans l\'historique');
      }

      return {
        response: response.response,
        processing_time: response.processing_time,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Erreur lors du traitement de la requête IA: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erreur lors du traitement de la requête IA: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Analyse prédictive d'une échéance
   * @param deadlineId ID de l'échéance à analyser
   * @returns Analyse prédictive de l'échéance
   * @throws HttpException en cas d'erreur
   */
  async predictDeadlineCompletion(deadlineId: string) {
    try {
      // Récupérer l'échéance
      const deadline = await this.deadlinesService.findOne(deadlineId);
      if (!deadline) {
        throw new HttpException('Échéance non trouvée', HttpStatus.NOT_FOUND);
      }

      this.logger.debug(`Analyse prédictive pour l'échéance ${deadlineId}: ${deadline.title}`);

      // Récupérer des échéances historiques similaires pour comparaison
      // Nous utiliserons une méthode à ajouter au service des échéances
      const historicalDeadlines: Deadline[] = await this.findSimilarDeadlines(deadline);

      // Préparer la requête pour le service IA
      const requestData = {
        deadline_data: {
          id: deadline.id,
          title: deadline.title,
          description: deadline.description,
          deadlineDate: deadline.deadlineDate,
          status: deadline.status,
          priority: deadline.priority,
          projectId: deadline.projectId,
          projectName: deadline.project?.name,
          createdAt: deadline.createdAt,
        },
        historical_data: historicalDeadlines.map(hd => ({
          id: hd.id,
          title: hd.title,
          description: hd.description,
          deadlineDate: hd.deadlineDate,
          status: hd.status,
          priority: hd.priority,
          projectId: hd.projectId,
          projectName: hd.project?.name,
          createdAt: hd.createdAt,
        })),
        user_id: deadline.creatorId,
      };

      // Envoyer la requête au service IA
      const response = await lastValueFrom(
        this.httpService.post(`${this.serviceUrl}/predict`, requestData).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error(`Erreur lors de la requête au service IA: ${error.message}`);
            throw new HttpException(
              `Erreur du service IA: ${error.response?.data?.detail || error.message}`,
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

      return {
        deadline_id: deadlineId,
        completion_probability: response.completion_probability,
        risk_factors: response.risk_factors,
        recommendations: response.recommendations,
        processing_time: response.processing_time,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'analyse prédictive: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erreur lors de l'analyse prédictive: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Méthode privée pour trouver des échéances similaires
   * @param deadline Échéance de référence
   * @returns Liste des échéances similaires
   * @private
   */
  private async findSimilarDeadlines(deadline: Deadline): Promise<Deadline[]> {
    // Cette méthode n'est pas encore implémentée dans DeadlinesService
    // Implémentation temporaire utilisant les échéances du même projet
    try {
      // Si l'échéance est liée à un projet, récupérer les échéances du projet
      if (deadline.projectId) {
        const projectDeadlines = await this.deadlinesService.findByProject(deadline.projectId);
        return projectDeadlines.filter(d => d.id !== deadline.id); // Filtrer l'échéance elle-même
      }
      
      // Sinon, récupérer les échéances du même créateur
      const userDeadlines = await this.deadlinesService.findByUser(deadline.creatorId);
      return userDeadlines.filter(d => d.id !== deadline.id); // Filtrer l'échéance elle-même
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche d'échéances similaires: ${error.message}`);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }
}