/**
 * Intercepteur de journalisation pour enregistrer les requêtes et réponses
 * @module LoggingInterceptor
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Intercepteur qui journalise les requêtes et les réponses
 * Utile pour le débogage et l'audit
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Logger privé pour cet intercepteur
   */
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercepte une requête et journalise son traitement
   * @param context Contexte d'exécution
   * @param next Gestionnaire d'appel pour continuer l'exécution
   * @returns Observable contenant la réponse
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Récupération des informations de la requête HTTP
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;
    const userId = user?.id || 'non-authentifié';
    
    // Journalisation de la requête entrante
    this.logger.log(`Requête [${method} ${url}] par utilisateur ${userId}`);
    
    // Récupération du temps de début
    const now = Date.now();
    
    // Traitement de la requête et journalisation après la réponse
    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          this.logger.log(`Réponse [${method} ${url}] après ${responseTime}ms - Statut: succès`);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Réponse [${method} ${url}] après ${responseTime}ms - Statut: erreur - ${error.message}`,
            error.stack
          );
        },
      }),
    );
  }
}