/**
 * Module d'intégration avec le service IA
 * Configure les composants nécessaires pour communiquer avec le service IA Python.
 * @module AiServiceModule
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiServiceController } from './ai-service.controller';
import { AiServiceService } from './ai-service.service';
import { ConversationsService } from './conversations.service';
import { AiConversation } from './entities/conversation.entity';
import { DeadlinesModule } from '../deadlines/deadlines.module';
import { UsersModule } from '../users/users.module';
import { ConversationsController } from './conversations.controller';

/**
 * Module d'intégration avec le service IA Python
 * Configure les composants nécessaires pour communiquer avec le service IA externe.
 */
@Module({
  imports: [
    // Importation du repository TypeORM pour les conversations
    TypeOrmModule.forFeature([AiConversation]),
    
    // Module HTTP pour les requêtes vers le service IA
    HttpModule.register({
      timeout: 60000, // 60 secondes de timeout
      maxRedirects: 5,
    }),
    ConfigModule,
    DeadlinesModule,
    UsersModule,
  ],
  controllers: [
    AiServiceController,
    ConversationsController
  ],
  providers: [
    AiServiceService,
    ConversationsService
  ],
  exports: [
    AiServiceService,
    ConversationsService
  ], // Exporte les services pour utilisation dans d'autres modules
})
export class AiServiceModule {}