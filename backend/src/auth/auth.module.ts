/**
 * Module d'authentification
 * Configure et fournit les services nécessaires à l'authentification des utilisateurs.
 * @module AuthModule
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Module d'authentification
 * Gère l'authentification et l'autorisation des utilisateurs
 */
@Module({
  imports: [
    // Import du module utilisateurs pour la vérification des identifiants
    UsersModule,
    
    // Configuration de Passport pour l'authentification
    PassportModule,
    
    // Configuration du module JWT pour la génération et validation des tokens
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importe le module de configuration
      inject: [ConfigService],  // Injecte le service de configuration
      useFactory: (configService: ConfigService) => ({
        // Récupère le secret JWT depuis les variables d'environnement
        // Utilise une valeur par défaut pour le développement (à ne pas utiliser en production)
        secret: configService.get<string>('JWT_SECRET') || 'secret_for_dev_only',
        signOptions: { 
          expiresIn: '8h', // Durée de validité du token
        },
      }),
    }),
  ],
  controllers: [AuthController], // Contrôleur pour les opérations d'authentification
  providers: [
    AuthService,  // Service d'authentification
    JwtStrategy,  // Stratégie JWT pour Passport
  ],
  exports: [AuthService], // Exporte le service d'authentification
})
export class AuthModule {}