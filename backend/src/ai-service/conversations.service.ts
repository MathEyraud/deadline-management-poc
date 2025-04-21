/**
 * Service pour la gestion des conversations IA
 * Contient toute la logique métier et l'accès aux données
 * pour les opérations liées aux conversations.
 * @module ConversationsService
 */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiConversation, ConversationMessage } from './entities/conversation.entity';
import { CreateConversationDto, UpdateConversationDto, AddMessageDto } from './dto/conversation.dto';

/**
 * Service pour la gestion des conversations IA
 * Gère la persistance et la récupération des historiques de conversation
 */
@Injectable()
export class ConversationsService {
  /**
   * Logger privé pour ce service
   */
  private readonly logger = new Logger(ConversationsService.name);

  /**
   * Constructeur du service
   * @param conversationsRepository Repository TypeORM pour les conversations
   */
  constructor(
    @InjectRepository(AiConversation)
    private conversationsRepository: Repository<AiConversation>,
  ) {}

  /**
   * Crée une nouvelle conversation
   * @param createConversationDto Données de la conversation à créer
   * @returns Promise contenant la conversation créée
   */
  async create(createConversationDto: CreateConversationDto): Promise<AiConversation> {
    // Création d'une nouvelle instance avec les données fournies
    const conversation = this.conversationsRepository.create({
      ...createConversationDto,
      messages: [], // Initialisation avec un tableau vide
    });
    
    // Sauvegarde dans la base de données
    this.logger.debug(`Création d'une nouvelle conversation pour l'utilisateur ${createConversationDto.userId}`);
    return this.conversationsRepository.save(conversation);
  }

  /**
   * Récupère toutes les conversations d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param activeOnly Si true, ne récupère que les conversations actives
   * @returns Promise contenant la liste des conversations
   */
  async findByUser(userId: string, activeOnly: boolean = true): Promise<AiConversation[]> {
    const query = this.conversationsRepository.createQueryBuilder('conversation')
      .where('conversation.userId = :userId', { userId });
    
    if (activeOnly) {
      query.andWhere('conversation.isActive = :isActive', { isActive: true });
    }
    
    query.orderBy('conversation.updatedAt', 'DESC');
    
    return query.getMany();
  }

  /**
   * Récupère une conversation par son ID
   * @param id ID de la conversation
   * @returns Promise contenant la conversation
   * @throws NotFoundException si la conversation n'existe pas
   */
  async findOne(id: string): Promise<AiConversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversation avec ID "${id}" non trouvée`);
    }
    
    return conversation;
  }

  /**
   * Met à jour une conversation
   * @param id ID de la conversation à mettre à jour
   * @param updateConversationDto Données de mise à jour
   * @returns Promise contenant la conversation mise à jour
   */
  async update(id: string, updateConversationDto: UpdateConversationDto): Promise<AiConversation> {
    const conversation = await this.findOne(id);
    
    // Mise à jour des champs fournis
    if (updateConversationDto.title !== undefined) {
      conversation.title = updateConversationDto.title;
    }
    
    if (updateConversationDto.isActive !== undefined) {
      conversation.isActive = updateConversationDto.isActive;
    }
    
    // Mise à jour de la date de dernière modification
    conversation.updatedAt = new Date();
    
    return this.conversationsRepository.save(conversation);
  }

  /**
   * Ajoute un message à une conversation
   * @param id ID de la conversation
   * @param addMessageDto Données du message à ajouter
   * @returns Promise contenant la conversation mise à jour
   */
  async addMessage(id: string, addMessageDto: AddMessageDto): Promise<AiConversation> {
    const conversation = await this.findOne(id);
    
    // Création du nouveau message
    const newMessage: ConversationMessage = {
      role: addMessageDto.role,
      content: addMessageDto.content,
      timestamp: new Date(),
    };
    
    // Ajout du message à la liste
    conversation.messages.push(newMessage);
    
    // Mise à jour du titre si c'est le premier message
    if (conversation.messages.length === 1 && addMessageDto.role === 'user') {
      // Utiliser les premiers mots du message comme titre (limité à 50 caractères)
      const titlePreview = addMessageDto.content.substring(0, 50);
      conversation.title = titlePreview + (titlePreview.length === 50 ? '...' : '');
    }
    
    // Mise à jour de la date de dernière modification
    conversation.updatedAt = new Date();
    
    this.logger.debug(`Ajout d'un message de type '${addMessageDto.role}' à la conversation ${id}`);
    return this.conversationsRepository.save(conversation);
  }

  /**
   * Récupère tous les messages d'une conversation
   * @param id ID de la conversation
   * @returns Promise contenant la liste des messages
   */
  async getMessages(id: string): Promise<ConversationMessage[]> {
    const conversation = await this.findOne(id);
    return conversation.messages;
  }

  /**
   * Archive une conversation (la marque comme inactive)
   * @param id ID de la conversation à archiver
   * @returns Promise contenant la conversation archivée
   */
  async archive(id: string): Promise<AiConversation> {
    return this.update(id, { isActive: false });
  }

  /**
   * Supprime une conversation
   * @param id ID de la conversation à supprimer
   */
  async remove(id: string): Promise<void> {
    const conversation = await this.findOne(id);
    await this.conversationsRepository.remove(conversation);
    this.logger.debug(`Suppression de la conversation ${id}`);
  }
}