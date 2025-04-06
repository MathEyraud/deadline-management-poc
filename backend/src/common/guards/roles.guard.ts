/**
 * Garde de rôles pour contrôler l'accès en fonction des rôles d'utilisateur
 * @module RolesGuard
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

/**
 * Garde qui vérifie si l'utilisateur a les rôles nécessaires pour accéder à une route
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Constructeur du garde
   * @param reflector Service pour accéder aux métadonnées
   */
  constructor(private reflector: Reflector) {}

  /**
   * Vérifie si l'utilisateur peut accéder à la route
   * @param context Contexte d'exécution
   * @returns true si l'accès est autorisé, false sinon
   */
  canActivate(context: ExecutionContext): boolean {
    // Récupération des rôles requis à partir des métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),  // Métadonnées au niveau de la méthode
      context.getClass(),    // Métadonnées au niveau de la classe
    ]);
    
    // Si aucun rôle n'est requis, l'accès est autorisé
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Récupération de l'utilisateur à partir de la requête
    const { user } = context.switchToHttp().getRequest();
    
    // Vérification que l'utilisateur existe et a un rôle
    if (!user || !user.role) {
      throw new ForbiddenException('Accès non autorisé');
    }
    
    // Vérification que l'utilisateur a l'un des rôles requis
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new ForbiddenException('Vous n\'avez pas les droits suffisants pour cette opération');
    }
    
    return true;
  }
}