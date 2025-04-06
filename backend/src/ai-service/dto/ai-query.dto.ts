/**
 * Data Transfer Object (DTO) pour les requêtes au service IA
 * Définit la structure des requêtes envoyées au service IA.
 * @module AiQueryDto
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

/**
 * DTO pour les requêtes au service IA
 * Définit et valide la structure des requêtes IA
 */
export class AiQueryDto {
  /**
   * La question ou l'instruction de l'utilisateur
   * @example 'Quelles sont mes échéances à venir cette semaine ?'
   */
  @ApiProperty({
    description: 'La question ou l\'instruction de l\'utilisateur',
    example: 'Quelles sont mes échéances à venir cette semaine ?'
  })
  @IsNotEmpty() // La requête ne peut pas être vide
  @IsString()   // La requête doit être une chaîne de caractères
  query: string;

  /**
   * Contexte optionnel (historique de conversation, etc.)
   * @example [{ role: 'user', content: 'Quelles sont mes projets actifs ?' }]
   */
  @ApiProperty({
    description: 'Contexte optionnel (historique de conversation, etc.)',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'user' },
        content: { type: 'string', example: 'Quelles sont mes projets actifs ?' }
      }
    }
  })
  @IsOptional() // Le contexte est optionnel
  @IsArray()    // Si fourni, le contexte doit être un tableau
  context?: any[];
}