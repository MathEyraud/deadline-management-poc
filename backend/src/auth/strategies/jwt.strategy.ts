/**
 * Stratégie d'authentification JWT pour Passport
 * Configure la validation des tokens JWT pour les requêtes authentifiées.
 * @module JwtStrategy
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Stratégie JWT pour Passport
 * Définit comment extraire et valider les tokens JWT
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructeur de la stratégie
   * @param configService Service de configuration pour accéder aux variables d'environnement
   */
  constructor(private configService: ConfigService) {
    super({
      // Extrait le token JWT de l'en-tête Authorization (format Bearer)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Vérifie si le token a expiré
      ignoreExpiration: false,
      // Utilise le même secret que pour la génération des tokens
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret_for_dev_only',
    });
  }

  /**
   * Fonction de validation appelée après vérification du token
   * @param payload Le contenu décodé du token JWT
   * @returns Les données utilisateur à attacher à la requête
   */
  async validate(payload: any) {
    // Retourne un objet utilisateur qui sera attaché à req.user
    return {
      id: payload.sub,         // ID de l'utilisateur
      email: payload.email,    // Email de l'utilisateur
      role: payload.role,      // Rôle de l'utilisateur
    };
  }
}