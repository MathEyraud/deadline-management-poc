/**
 * Module des échéances
 * Configure les dépendances et services nécessaires à la gestion des échéances.
 * @module DeadlinesModule
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeadlinesController } from './deadlines.controller';
import { DeadlinesService } from './deadlines.service';
import { Deadline } from './entities/deadline.entity';

/**
 * Module des échéances
 * Regroupe les composants liés à la gestion des échéances
 */
@Module({
  imports: [
    // Importation de l'entité Deadline pour TypeORM
    TypeOrmModule.forFeature([Deadline]),
  ],
  controllers: [DeadlinesController], // Contrôleur pour gérer les requêtes HTTP
  providers: [DeadlinesService],      // Service contenant la logique métier
  exports: [DeadlinesService],        // Exporte le service pour utilisation dans d'autres modules
})
export class DeadlinesModule {}