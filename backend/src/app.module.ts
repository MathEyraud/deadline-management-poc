/**
 * Module principal de l'application qui importe et configure
 * tous les autres modules nécessaires au fonctionnement de l'application.
 * @module AppModule
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DeadlinesModule } from './deadlines/deadlines.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamsModule } from './teams/teams.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { AiServiceModule } from './ai-service/ai-service.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

/**
 * Module principal qui configure:
 * - Les variables d'environnement
 * - La connexion à la base de données
 * - L'import de tous les modules fonctionnels
 * - Les filtres, intercepteurs et gardes globaux
 */
@Module({
  imports: [
    // Configuration des variables d'environnement
    // isGlobal: true permet d'accéder à ConfigService depuis tous les modules sans ré-import
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Configuration de la connexion à la base de données SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite', // Type de base de données
      database: join(__dirname, '..', 'data', 'deadline-db.sqlite'), // Chemin du fichier DB
      entities: [join(__dirname, '**', '*.entity.{ts,js}')], // Détection automatique des entités
      synchronize: true, // Synchronisation automatique du schéma (à désactiver en production)
    }),
    
    // Import des modules fonctionnels
    UsersModule,        // Gestion des utilisateurs
    AuthModule,         // Authentification
    DeadlinesModule,    // Gestion des échéances
    ProjectsModule,     // Gestion des projets
    TeamsModule,        // Gestion des équipes
    CommentsModule,     // Gestion des commentaires
    AttachmentsModule,  // Gestion des pièces jointes
    AiServiceModule,    // Intégration avec le service IA
  ],
  
  // Fournisseurs globaux (filtres, intercepteurs, gardes)
  providers: [
    // Filtre global pour les exceptions HTTP
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    
    // Intercepteur global pour la journalisation
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    
    // Garde global pour l'authentification JWT (toutes les routes protégées par défaut)
    // TODO : Commenté pour le POC - décommenter pour protéger toutes les routes par défaut
    /*
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    */
  ],
})
export class AppModule {}