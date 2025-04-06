/**
 * Service pour la gestion des pièces jointes
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux pièces jointes.
 * @module AttachmentsService
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';
import { Deadline } from '../deadlines/entities/deadline.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service pour la gestion des pièces jointes
 * Gère la logique métier et les opérations CRUD sur les pièces jointes
 */
@Injectable()
export class AttachmentsService {
  /**
   * Constructeur du service
   * @param attachmentsRepository Repository TypeORM pour les pièces jointes
   * @param deadlinesRepository Repository TypeORM pour les échéances
   */
  constructor(
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    @InjectRepository(Deadline)
    private deadlinesRepository: Repository<Deadline>,
  ) {}

  /**
   * Crée une nouvelle pièce jointe
   * @param createAttachmentDto Données de la pièce jointe à créer
   * @returns Promise contenant la pièce jointe créée
   */
  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    // Vérifier que l'échéance existe
    const deadline = await this.deadlinesRepository.findOne({
      where: { id: createAttachmentDto.deadlineId },
    });
    
    if (!deadline) {
      throw new NotFoundException(`Échéance avec ID "${createAttachmentDto.deadlineId}" non trouvée`);
    }
    
    // Création d'une nouvelle instance avec les données fournies
    const attachment = this.attachmentsRepository.create(createAttachmentDto);
    
    // Sauvegarde dans la base de données
    return this.attachmentsRepository.save(attachment);
  }

  /**
   * Récupère toutes les pièces jointes avec filtres optionnels
   * @param filters Objet contenant les filtres à appliquer
   * @returns Promise contenant la liste des pièces jointes correspondant aux critères
   */
  async findAll(filters?: {
    deadlineId?: string;
    uploaderId?: string;
    classification?: string;
  }): Promise<Attachment[]> {
    // Création d'un query builder pour construire la requête de manière dynamique
    const query = this.attachmentsRepository.createQueryBuilder('attachment');
    
    // Ajout des conditions de filtre si elles sont présentes
    if (filters) {
      if (filters.deadlineId) {
        query.andWhere('attachment.deadlineId = :deadlineId', { deadlineId: filters.deadlineId });
      }
      
      if (filters.uploaderId) {
        query.andWhere('attachment.uploaderId = :uploaderId', { uploaderId: filters.uploaderId });
      }
      
      if (filters.classification) {
        query.andWhere('attachment.classification = :classification', { classification: filters.classification });
      }
    }
    
    // Chargement des relations pour obtenir des données complètes
    query.leftJoinAndSelect('attachment.uploader', 'uploader');
    query.leftJoinAndSelect('attachment.deadline', 'deadline');
    
    // Tri par date d'upload (du plus récent au plus ancien)
    query.orderBy('attachment.uploadedAt', 'DESC');
    
    // Exécution de la requête
    return query.getMany();
  }

  /**
   * Récupère une pièce jointe spécifique par son ID
   * @param id ID de la pièce jointe à récupérer
   * @returns Promise contenant la pièce jointe trouvée
   * @throws NotFoundException si la pièce jointe n'existe pas
   */
  async findOne(id: string): Promise<Attachment> {
    // Recherche de la pièce jointe avec ses relations
    const attachment = await this.attachmentsRepository.findOne({
      where: { id },
      relations: ['uploader', 'deadline'],
    });
    
    // Si la pièce jointe n'existe pas, lever une exception
    if (!attachment) {
      throw new NotFoundException(`Pièce jointe avec ID "${id}" non trouvée`);
    }
    
    return attachment;
  }

  /**
   * Met à jour une pièce jointe existante
   * @param id ID de la pièce jointe à mettre à jour
   * @param updateAttachmentDto Données de mise à jour
   * @param currentUserId ID de l'utilisateur effectuant la mise à jour
   * @returns Promise contenant la pièce jointe mise à jour
   * @throws ForbiddenException si l'utilisateur n'est pas l'uploader de la pièce jointe
   */
  async update(id: string, updateAttachmentDto: UpdateAttachmentDto, currentUserId: string): Promise<Attachment> {
    // Récupération de la pièce jointe existante
    const attachment = await this.findOne(id);
    
    // Vérifier que l'utilisateur est bien l'uploader de la pièce jointe
    if (attachment.uploaderId !== currentUserId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette pièce jointe');
    }
    
    // Mise à jour uniquement des champs fournis et autorisés
    // (certains champs comme path, size, etc. ne devraient pas être modifiables directement)
    if (updateAttachmentDto.classification !== undefined) {
      attachment.classification = updateAttachmentDto.classification;
    }
    
    // Sauvegarde des modifications
    return this.attachmentsRepository.save(attachment);
  }

  /**
   * Supprime une pièce jointe
   * @param id ID de la pièce jointe à supprimer
   * @param currentUserId ID de l'utilisateur effectuant la suppression
   * @throws ForbiddenException si l'utilisateur n'est pas l'uploader de la pièce jointe
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    // Récupération de la pièce jointe à supprimer
    const attachment = await this.findOne(id);
    
    // Vérifier que l'utilisateur est bien l'uploader de la pièce jointe
    if (attachment.uploaderId !== currentUserId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette pièce jointe');
    }
    
    // Supprimer le fichier physique
    try {
      fs.unlinkSync(attachment.path);
    } catch (error) {
      // Log l'erreur mais continue (le fichier peut être déjà supprimé)
      console.error(`Erreur lors de la suppression du fichier ${attachment.path}: ${error.message}`);
    }
    
    // Suppression de la pièce jointe dans la base de données
    await this.attachmentsRepository.remove(attachment);
  }

  /**
   * Récupère toutes les pièces jointes d'une échéance spécifique
   * @param deadlineId ID de l'échéance
   * @returns Promise contenant la liste des pièces jointes de l'échéance
   */
  async findByDeadline(deadlineId: string): Promise<Attachment[]> {
    return this.findAll({ deadlineId });
  }

  /**
   * Récupère toutes les pièces jointes ajoutées par un utilisateur spécifique
   * @param uploaderId ID de l'utilisateur
   * @returns Promise contenant la liste des pièces jointes de l'utilisateur
   */
  async findByUploader(uploaderId: string): Promise<Attachment[]> {
    return this.findAll({ uploaderId });
  }
}