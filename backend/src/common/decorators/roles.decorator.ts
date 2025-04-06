/**
 * Décorateurs personnalisés pour l'application
 * Fournit des décorateurs réutilisables pour simplifier le code.
 * @module RolesDecorator
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

/**
 * Clé de métadonnée pour les rôles
 */
export const ROLES_KEY = 'roles';

/**
 * Décorateur pour spécifier les rôles autorisés pour un endpoint
 * @param roles Liste des rôles autorisés
 * @returns Décorateur de rôles
 * @example
 * ```typescript
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * @Get('protected')
 * getProtectedRoute() { ... }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);