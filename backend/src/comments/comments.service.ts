/**
 * Service pour la gestion des commentaires
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux commentaires.
 * @module CommentsService
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentVisibility } from './entities/comment.entity';
import { Deadline } from '../deadlines/entities/deadline.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

/**
 * Service pour la gestion des commentaires
 * Gère la logique métier et les opérations CRUD sur les commentaires
 */
@Injectable()
export class CommentsService {
  /**
   * Constructeur du service
   * @param commentsRepository Repository TypeORM pour les commentaires
   * @param deadlinesRepository Repository TypeORM pour les échéances
   */
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Deadline)
    private deadlinesRepository: Repository<Deadline>,
  ) {}

  /**
   * Crée un nouveau commentaire
   * @param createCommentDto Données du commentaire à créer
   * @returns Promise contenant le commentaire créé
   */
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // Vérifier que l'échéance existe
    const deadline = await this.deadlinesRepository.findOne({
      where: { id: createCommentDto.deadlineId },
    });
    
    if (!deadline) {
      throw new NotFoundException(`Échéance avec ID "${createCommentDto.deadlineId}" non trouvée`);
    }
    
    // Création d'une nouvelle instance avec les données fournies
    const comment = this.commentsRepository.create(createCommentDto);
    
    // Sauvegarde dans la base de données
    return this.commentsRepository.save(comment);
  }

  /**
   * Récupère tous les commentaires avec filtres optionnels
   * @param filters Objet contenant les filtres à appliquer
   * @returns Promise contenant la liste des commentaires correspondant aux critères
   */
  async findAll(filters?: {
    authorId?: string;
    deadlineId?: string;
    visibility?: CommentVisibility;
  }): Promise<Comment[]> {
    // Création d'un query builder pour construire la requête de manière dynamique
    const query = this.commentsRepository.createQueryBuilder('comment');
    
    // Ajout des conditions de filtre si elles sont présentes
    if (filters) {
      if (filters.authorId) {
        query.andWhere('comment.authorId = :authorId', { authorId: filters.authorId });
      }
      
      if (filters.deadlineId) {
        query.andWhere('comment.deadlineId = :deadlineId', { deadlineId: filters.deadlineId });
      }
      
      if (filters.visibility) {
        query.andWhere('comment.visibility = :visibility', { visibility: filters.visibility });
      }
    }
    
    // Chargement des relations pour obtenir des données complètes
    query.leftJoinAndSelect('comment.author', 'author');
    query.leftJoinAndSelect('comment.deadline', 'deadline');
    
    // Tri par date de création (du plus récent au plus ancien)
    query.orderBy('comment.createdAt', 'DESC');
    
    // Exécution de la requête
    return query.getMany();
  }

  /**
   * Récupère un commentaire spécifique par son ID
   * @param id ID du commentaire à récupérer
   * @returns Promise contenant le commentaire trouvé
   * @throws NotFoundException si le commentaire n'existe pas
   */
  async findOne(id: string): Promise<Comment> {
    // Recherche du commentaire avec ses relations
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'deadline'],
    });
    
    // Si le commentaire n'existe pas, lever une exception
    if (!comment) {
      throw new NotFoundException(`Commentaire avec ID "${id}" non trouvé`);
    }
    
    return comment;
  }

  /**
   * Met à jour un commentaire existant
   * @param id ID du commentaire à mettre à jour
   * @param updateCommentDto Données de mise à jour
   * @param currentUserId ID de l'utilisateur effectuant la mise à jour
   * @returns Promise contenant le commentaire mis à jour
   * @throws ForbiddenException si l'utilisateur n'est pas l'auteur du commentaire
   */
  async update(id: string, updateCommentDto: UpdateCommentDto, currentUserId: string): Promise<Comment> {
    // Récupération du commentaire existant
    const comment = await this.findOne(id);
    
    // Vérifier que l'utilisateur est bien l'auteur du commentaire
    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce commentaire');
    }
    
    // Mise à jour uniquement des champs fournis
    if (updateCommentDto.content) comment.content = updateCommentDto.content;
    if (updateCommentDto.visibility) comment.visibility = updateCommentDto.visibility;
    
    // Sauvegarde des modifications
    return this.commentsRepository.save(comment);
  }

  /**
   * Supprime un commentaire
   * @param id ID du commentaire à supprimer
   * @param currentUserId ID de l'utilisateur effectuant la suppression
   * @throws ForbiddenException si l'utilisateur n'est pas l'auteur du commentaire
   */
  async remove(id: string, currentUserId: string): Promise<void> {
    // Récupération du commentaire à supprimer
    const comment = await this.findOne(id);
    
    // Vérifier que l'utilisateur est bien l'auteur du commentaire
    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce commentaire');
    }
    
    // Suppression du commentaire
    await this.commentsRepository.remove(comment);
  }

  /**
   * Récupère tous les commentaires d'une échéance spécifique
   * @param deadlineId ID de l'échéance
   * @returns Promise contenant la liste des commentaires de l'échéance
   */
  async findByDeadline(deadlineId: string): Promise<Comment[]> {
    return this.findAll({ deadlineId });
  }

  /**
   * Récupère tous les commentaires d'un utilisateur spécifique
   * @param authorId ID de l'utilisateur
   * @returns Promise contenant la liste des commentaires de l'utilisateur
   */
  async findByAuthor(authorId: string): Promise<Comment[]> {
    return this.findAll({ authorId });
  }
}