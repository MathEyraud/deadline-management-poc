/**
 * Module pour la gestion des pièces jointes
 * Configure les composants nécessaires à la gestion des pièces jointes.
 * @module AttachmentsModule
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { Attachment } from './entities/attachment.entity';
import { Deadline } from '../deadlines/entities/deadline.entity';
import * as path from 'path';
import * as fs from 'fs';

// Création du répertoire d'upload s'il n'existe pas
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Module des pièces jointes
 * Regroupe les composants liés à la gestion des pièces jointes
 */
@Module({
  imports: [
    // Configuration de Multer pour la gestion des uploads
    MulterModule.register({
      dest: uploadsDir,
    }),
    // Import des entités nécessaires pour TypeORM
    TypeOrmModule.forFeature([Attachment, Deadline]),
  ],
  controllers: [AttachmentsController], // Contrôleur pour gérer les requêtes HTTP
  providers: [AttachmentsService], // Service contenant la logique métier
  exports: [AttachmentsService], // Exporte le service pour utilisation dans d'autres modules
})
export class AttachmentsModule {}