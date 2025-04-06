/**
 * Module pour la gestion des projets
 * Configure les composants nécessaires à la gestion des projets.
 * @module ProjectsModule
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';

/**
 * Module des projets
 * Regroupe les composants liés à la gestion des projets
 */
@Module({
  imports: [
    // Import de l'entité Project pour TypeORM
    TypeOrmModule.forFeature([Project]),
  ],
  controllers: [ProjectsController], // Contrôleur pour gérer les requêtes HTTP
  providers: [ProjectsService], // Service contenant la logique métier
  exports: [ProjectsService], // Exporte le service pour utilisation dans d'autres modules
})
export class ProjectsModule {}