/**
 * Module pour la gestion des utilisateurs
 * Configure les composants nécessaires à la gestion des utilisateurs.
 * @module UsersModule
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

/**
 * Module des utilisateurs
 * Regroupe les composants liés à la gestion des utilisateurs
 */
@Module({
  imports: [
    // Import de l'entité User pour TypeORM
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController], // Contrôleur pour gérer les requêtes HTTP
  providers: [UsersService], // Service contenant la logique métier
  exports: [UsersService], // Exporte le service pour utilisation dans d'autres modules (ex: auth)
})
export class UsersModule {}