/**
 * Module d'intégration avec le service IA
 * Configure les composants nécessaires pour communiquer avec le service IA Python.
 * @module AiServiceModule
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';

/**
 * Module d'intégration avec le service IA
 * Regroupe les composants liés à l'IA conversationnelle
 */
@Module({
  imports: [
    // Module HTTP pour les requêtes vers le service Python
    HttpModule,
  ],
  controllers: [AiServiceController], // Contrôleur pour les endpoints IA
  providers: [AiServiceService],      // Service pour la communication avec l'IA
  exports: [AiServiceService],        // Exporte le service pour utilisation dans d'autres modules
})
export class AiServiceModule {}