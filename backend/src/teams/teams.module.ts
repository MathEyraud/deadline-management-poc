/**
 * Module pour la gestion des équipes
 * Configure les composants nécessaires à la gestion des équipes.
 * @module TeamsModule
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { User } from '../users/entities/user.entity';

/**
 * Module des équipes
 * Regroupe les composants liés à la gestion des équipes
 */
@Module({
  imports: [
    // Import des entités nécessaires pour TypeORM
    TypeOrmModule.forFeature([Team, User]),
  ],
  controllers: [TeamsController], // Contrôleur pour gérer les requêtes HTTP
  providers: [TeamsService], // Service contenant la logique métier
  exports: [TeamsService], // Exporte le service pour utilisation dans d'autres modules
})
export class TeamsModule {}