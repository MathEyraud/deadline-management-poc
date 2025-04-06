/**
 * Data Transfer Object (DTO) pour la création d'un commentaire
 * Définit et valide la structure des données entrantes lors de la création.
 * @module CreateCommentDto
 */
import { IsNotEmpty, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommentVisibility } from '../entities/comment.entity';

/**
 * DTO pour la création d'un commentaire
 * Définit et valide les données d'entrée pour la création de commentaires
 */
export class CreateCommentDto {
  /**
   * Contenu du commentaire
   * @example 'Nous devons avancer sur cette tâche rapidement.'
   */
  @ApiProperty({ 
    description: 'Contenu du commentaire', 
    example: 'Nous devons avancer sur cette tâche rapidement.' 
  })
  @IsNotEmpty() // Le contenu ne peut pas être vide
  @IsString()   // Le contenu doit être une chaîne de caractères
  content: string;

  /**
   * ID de l'utilisateur auteur du commentaire
   * @example '5f8d0f55-e477-4915-b522-c21ba1f70d9e'
   */
  @ApiProperty({ 
    description: 'ID de l\'utilisateur auteur du commentaire', 
    example: '5f8d0f55-e477-4915-b522-c21ba1f70d9e' 
  })
  @IsNotEmpty() // L'ID de l'auteur ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  authorId: string;

  /**
   * ID de l'échéance associée au commentaire
   * @example '7a9d0f35-d562-4219-c732-d35cf1a2e5f9'
   */
  @ApiProperty({ 
    description: 'ID de l\'échéance associée au commentaire', 
    example: '7a9d0f35-d562-4219-c732-d35cf1a2e5f9' 
  })
  @IsNotEmpty() // L'ID de l'échéance ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  deadlineId: string;

  /**
   * Visibilité du commentaire
   * @example CommentVisibility.PUBLIC
   */
  @ApiProperty({ 
    description: 'Visibilité du commentaire', 
    enum: CommentVisibility,
    example: CommentVisibility.PUBLIC
  })
  @IsEnum(CommentVisibility) // La valeur doit être l'une des valeurs de l'énumération
  visibility: CommentVisibility;
}