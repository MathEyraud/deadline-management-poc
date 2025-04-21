/**
 * Data Transfer Object (DTO) pour les conversations IA
 * Définit la structure des requêtes pour gérer les conversations.
 * @module ConversationDto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsBoolean, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationMessage } from '../entities/conversation.entity';

/**
 * DTO pour créer une nouvelle conversation
 */
export class CreateConversationDto {
  /**
   * Titre de la conversation
   * @example 'Discussion sur les échéances du projet Alpha'
   */
  @ApiProperty({
    description: 'Titre de la conversation',
    example: 'Discussion sur les échéances du projet Alpha',
  })
  @IsString()
  title: string;

  /**
   * ID de l'utilisateur participant à la conversation
   * (Normalement extrait du token JWT)
   */
  @ApiProperty({
    description: 'ID de l\'utilisateur participant',
    example: '5f8d0f55-e477-4915-b522-c21ba1f70d9e',
  })
  @IsUUID()
  userId: string;
}

/**
 * DTO pour mettre à jour une conversation
 */
export class UpdateConversationDto {
  /**
   * Titre mis à jour de la conversation (optionnel)
   * @example 'Discussion projet Alpha - Planification'
   */
  @ApiProperty({
    description: 'Titre mis à jour de la conversation',
    example: 'Discussion projet Alpha - Planification',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Statut d'activité de la conversation (optionnel)
   * @example false
   */
  @ApiProperty({
    description: 'Statut d\'activité de la conversation',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO pour ajouter un message à une conversation
 */
export class AddMessageDto {
  /**
   * Rôle du message (user ou assistant)
   * @example 'user'
   */
  @ApiProperty({
    description: 'Rôle du message',
    example: 'user',
    enum: ['user', 'assistant'],
  })
  @IsString()
  role: 'user' | 'assistant';

  /**
   * Contenu du message
   * @example 'Quelles sont mes échéances à venir cette semaine?'
   */
  @ApiProperty({
    description: 'Contenu du message',
    example: 'Quelles sont mes échéances à venir cette semaine?',
  })
  @IsString()
  content: string;
}