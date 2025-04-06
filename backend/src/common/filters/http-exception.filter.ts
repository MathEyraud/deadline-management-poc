/**
 * Filtre d'exception global pour formater les erreurs HTTP
 * @module HttpExceptionFilter
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface pour la réponse d'erreur standardisée
 */
interface HttpExceptionResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  errorName?: string;
}

/**
 * Filtre qui intercepte toutes les exceptions HTTP et les formate de manière cohérente
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * Logger privé pour ce filtre
   */
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Capture et formate une exception HTTP
   * @param exception L'exception interceptée
   * @param host Le contexte d'hôte
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    // Récupération du contexte HTTP
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Récupération du statut et de la réponse d'erreur
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();
    const errorName = exception.name;
    
    // Journalisation de l'erreur
    this.logger.error(
      `${request.method} ${request.url} - Statut ${status} - ${exception.message}`,
      exception.stack
    );
    
    // Extraction du message d'erreur avec vérification de type appropriée
    let errorMessage: string;
    if (typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse) {
      // Gérer plusieurs formats possibles de message d'erreur
      const rawMessage = errorResponse['message'];
      if (Array.isArray(rawMessage)) {
        // Si c'est un tableau (cas fréquent des erreurs de validation), joindre les messages
        errorMessage = rawMessage.join(', ');
      } else {
        // Convertir en chaîne de caractères si nécessaire
        errorMessage = String(rawMessage);
      }
    } else {
      // Utiliser le message de l'exception comme fallback
      errorMessage = exception.message;
    }
    
    // Formatage de la réponse d'erreur standardisée
    const responseBody: HttpExceptionResponse = {
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorName: errorName,
    };
    
    // Envoi de la réponse formatée
    response.status(status).json(responseBody);
  }
}