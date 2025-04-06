/**
 * Contrôleur pour la gestion des pièces jointes
 * Gère les points d'accès (endpoints) pour les opérations liées aux pièces jointes.
 * @module AttachmentsController
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Attachment } from './entities/attachment.entity';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Configuration pour le stockage des fichiers uploadés
 */
const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    // Dossier de destination des fichiers
    const uploadsDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Génération d'un nom de fichier unique pour éviter les collisions
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, fileExt)}_${uniqueSuffix}${fileExt}`);
  },
});

/**
 * Contrôleur des pièces jointes
 * Gère toutes les opérations CRUD et les recherches sur les pièces jointes
 */
@ApiTags('attachments') // Tag Swagger pour le regroupement des endpoints
@ApiBearerAuth() // Indique que l'authentification Bearer est nécessaire
@UseGuards(JwtAuthGuard) // Protection de toutes les routes avec JWT
@Controller('attachments') // Préfixe de route
export class AttachmentsController {
  /**
   * Constructeur du contrôleur
   * @param attachmentsService Service d'accès aux données des pièces jointes
   */
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Crée une nouvelle pièce jointe (upload de fichier)
   * @param file Fichier uploadé
   * @param createAttachmentDto Données de la pièce jointe à créer
   * @param req Objet requête contenant les informations d'authentification
   * @returns La pièce jointe créée
   */
  @Post('upload')
  @ApiOperation({ summary: 'Uploader une nouvelle pièce jointe' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        deadlineId: {
          type: 'string',
        },
        classification: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Pièce jointe créée avec succès', type: Attachment })
  @ApiResponse({ status: 404, description: 'Échéance non trouvée' })
  @UseInterceptors(FileInterceptor('file', { storage: multerStorage }))
  async uploadFile(
    @UploadedFile() file,
    @Body() body: { deadlineId: string; classification?: string },
    @Req() req,
  ) {
    // Récupération de l'ID utilisateur depuis le token JWT
    const uploaderId = req.user.id;
    
    // Création de l'objet DTO
    const createAttachmentDto: CreateAttachmentDto = {
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      deadlineId: body.deadlineId,
      uploaderId,
      classification: body.classification,
    };
    
    return this.attachmentsService.create(createAttachmentDto);
  }

  /**
   * Récupère toutes les pièces jointes avec filtres optionnels
   * @param deadlineId Filtre optionnel par ID d'échéance
   * @param uploaderId Filtre optionnel par ID d'uploader
   * @param classification Filtre optionnel par classification
   * @returns Liste des pièces jointes correspondant aux critères
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les pièces jointes' })
  @ApiQuery({ name: 'deadlineId', type: String, required: false })
  @ApiQuery({ name: 'uploaderId', type: String, required: false })
  @ApiQuery({ name: 'classification', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Liste des pièces jointes', type: [Attachment] })
  findAll(
    @Query('deadlineId') deadlineId?: string,
    @Query('uploaderId') uploaderId?: string,
    @Query('classification') classification?: string,
  ) {
    return this.attachmentsService.findAll({ deadlineId, uploaderId, classification });
  }

  /**
   * Récupère une pièce jointe par son ID
   * @param id ID de la pièce jointe à récupérer
   * @returns La pièce jointe trouvée
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une pièce jointe par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la pièce jointe' })
  @ApiResponse({ status: 200, description: 'Pièce jointe trouvée', type: Attachment })
  @ApiResponse({ status: 404, description: 'Pièce jointe non trouvée' })
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  /**
   * Met à jour une pièce jointe existante
   * @param id ID de la pièce jointe à mettre à jour
   * @param updateAttachmentDto Données de mise à jour
   * @param req Objet requête contenant les informations d'authentification
   * @returns La pièce jointe mise à jour
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une pièce jointe' })
  @ApiParam({ name: 'id', description: 'ID de la pièce jointe' })
  @ApiResponse({ status: 200, description: 'Pièce jointe mise à jour', type: Attachment })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pièce jointe non trouvée' })
  update(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
    @Req() req,
  ) {
    // Récupération de l'ID utilisateur depuis le token JWT
    const currentUserId = req.user.id;
    return this.attachmentsService.update(id, updateAttachmentDto, currentUserId);
  }

  /**
   * Supprime une pièce jointe
   * @param id ID de la pièce jointe à supprimer
   * @param req Objet requête contenant les informations d'authentification
   * @returns Confirmation de suppression
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une pièce jointe' })
  @ApiParam({ name: 'id', description: 'ID de la pièce jointe' })
  @ApiResponse({ status: 200, description: 'Pièce jointe supprimée' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiResponse({ status: 404, description: 'Pièce jointe non trouvée' })
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    // Récupération de l'ID utilisateur depuis le token JWT
    const currentUserId = req.user.id;
    return this.attachmentsService.remove(id, currentUserId);
  }

  /**
   * Récupère toutes les pièces jointes d'une échéance spécifique
   * @param deadlineId ID de l'échéance
   * @returns Liste des pièces jointes de l'échéance
   */
  @Get('deadline/:deadlineId')
  @ApiOperation({ summary: 'Récupérer les pièces jointes par échéance' })
  @ApiParam({ name: 'deadlineId', description: 'ID de l\'échéance' })
  @ApiResponse({ status: 200, description: 'Liste des pièces jointes de l\'échéance', type: [Attachment] })
  findByDeadline(@Param('deadlineId') deadlineId: string) {
    return this.attachmentsService.findByDeadline(deadlineId);
  }

  /**
   * Récupère toutes les pièces jointes ajoutées par un utilisateur spécifique
   * @param uploaderId ID de l'utilisateur
   * @returns Liste des pièces jointes de l'utilisateur
   */
  @Get('uploader/:uploaderId')
  @ApiOperation({ summary: 'Récupérer les pièces jointes par uploader' })
  @ApiParam({ name: 'uploaderId', description: 'ID de l\'uploader' })
  @ApiResponse({ status: 200, description: 'Liste des pièces jointes de l\'uploader', type: [Attachment] })
  findByUploader(@Param('uploaderId') uploaderId: string) {
    return this.attachmentsService.findByUploader(uploaderId);
  }
}