/**
 * Data Transfer Object (DTO) pour les requêtes au service IA
 * Définit la structure des requêtes envoyées au service IA.
 * @module AiQueryDto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsBoolean, IsOptional, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO pour les messages individuels dans le contexte de conversation
 */
export class MessageItemDto {
  /**
   * Rôle du message (user, assistant)
   * @example 'user'
   */
  @ApiProperty({ description: 'Rôle du message', example: 'user' })
  @IsString()
  role: string;

  /**
   * Contenu du message
   * @example 'Quelles sont mes échéances à venir cette semaine?'
   */
  @ApiProperty({ description: 'Contenu du message', example: 'Quelles sont mes échéances à venir cette semaine?' })
  @IsString()
  content: string;
}

/**
 * DTO pour les requêtes au service IA
 * Définit et valide la structure des requêtes IA
 */
export class AiQueryDto {
  /**
   * La question ou l'instruction de l'utilisateur
   * @example 'Quelles sont mes échéances à venir cette semaine?'
   */
  @ApiProperty({
    description: 'La question ou l\'instruction de l\'utilisateur',
    example: 'Quelles sont mes échéances à venir cette semaine?'
  })
  @IsString()
  query: string;

  /**
   * Contexte optionnel (historique de conversation)
   */
  @ApiProperty({
    description: 'Contexte optionnel (historique de conversation)',
    required: false,
    type: [MessageItemDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageItemDto)
  context?: MessageItemDto[];

  /**
   * Indique si les échéances de l'utilisateur doivent être incluses
   * @example true
   */
  @ApiProperty({
    description: 'Inclure les échéances de l\'utilisateur',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeDeadlines?: boolean = true;

  /**
   * Indique si la conversation doit être sauvegardée dans l'historique
   * @example true
   */
  @ApiProperty({
    description: 'Sauvegarder la conversation dans l\'historique',
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  saveToHistory?: boolean = true;
  
  /**
   * ID de la conversation à utiliser/continuer
   * Si non fourni et saveToHistory=true, une nouvelle conversation sera créée
   */
  @ApiProperty({
    description: 'ID de la conversation existante à continuer',
    required: false,
    example: '7a9d0f35-d562-4219-c732-d35cf1a2e5f9'
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}