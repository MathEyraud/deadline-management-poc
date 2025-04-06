/**
 * Garde d'authentification JWT
 * Protège les routes en vérifiant la présence et la validité du token JWT.
 * @module JwtAuthGuard
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Garde d'authentification JWT
 * Étend le guard Passport pour utiliser la stratégie JWT
 * Utilisé pour protéger les routes qui nécessitent une authentification
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}