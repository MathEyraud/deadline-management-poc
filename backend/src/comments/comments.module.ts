/**
 * Module pour la gestion des commentaires
 * Configure les composants nécessaires à la gestion des commentaires.
 * @module CommentsModule
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Deadline } from '../deadlines/entities/deadline.entity';

/**
 * Module des commentaires
 * Regroupe les composants liés à la gestion des commentaires
 */
@Module({
  imports: [
    // Import des entités nécessaires pour TypeORM
    TypeOrmModule.forFeature([Comment, Deadline]),
  ],
  controllers: [CommentsController], // Contrôleur pour gérer les requêtes HTTP
  providers: [CommentsService], // Service contenant la logique métier
  exports: [CommentsService], // Exporte le service pour utilisation dans d'autres modules
})
export class CommentsModule {}