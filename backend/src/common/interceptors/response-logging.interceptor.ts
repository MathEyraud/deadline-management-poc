// src/common/interceptors/response-logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ResponseInspector');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Récupère le contexte HTTP
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const userId = req.user?.id || 'non authentifié';

    return next.handle().pipe(
      tap((data) => {
        // Log les détails de la réponse
        if (url.includes('/deadlines')) {  // Filtrer seulement les endpoints d'échéances
          this.logger.debug(
            `[RÉPONSE] ${method} ${url} User: ${userId}\n` +
            `DATA: ${JSON.stringify(data, this.replaceCircular, 2)}`
          );
          
          // Si c'est une liste d'échéances, compter les éléments
          if (Array.isArray(data)) {
            this.logger.debug(`NOMBRE D'ÉCHÉANCES RENVOYÉES: ${data.length}`);
          }
        }
      }),
    );
  }

  // Fonction pour gérer les références circulaires lors de la sérialisation JSON
  private replaceCircular(key: any, value: any) {
    if (key && key.startsWith('_')) {
      return undefined; // Exclure les propriétés internes commençant par _
    }
    
    const seen = new Set();
    return (function replacer(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    })(key, value);
  }
}