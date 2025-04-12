/**
 * Module d'intégration avec le service IA
 * Configure les composants nécessaires pour communiquer avec le service IA Python.
 * @module AiServiceModule
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';
import { DeadlinesModule } from '../deadlines/deadlines.module';
import { UsersModule } from '../users/users.module';

/**
 * Module d'intégration avec le service IA Python
 * Configure les composants nécessaires pour communiquer avec le service IA externe.
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 60000, // 60 secondes de timeout
      maxRedirects: 5,
    }),
    ConfigModule,
    DeadlinesModule,
    UsersModule,
  ],
  controllers: [AiServiceController],
  providers: [AiServiceService],
  exports: [AiServiceService], // Exporte le service pour utilisation dans d'autres modules
})
export class AiServiceModule {}