/**
 * Data Transfer Object (DTO) pour la création d'une pièce jointe
 * Définit et valide la structure des données entrantes lors de la création.
 * @module CreateAttachmentDto
 */
import { IsNotEmpty, IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la création d'une pièce jointe
 * Définit et valide les données d'entrée pour la création de pièces jointes
 */
export class CreateAttachmentDto {
  /**
   * Nom du fichier
   * @example 'rapport_mensuel.pdf'
   */
  @ApiProperty({ description: 'Nom du fichier', example: 'rapport_mensuel.pdf' })
  @IsNotEmpty() // Le nom ne peut pas être vide
  @IsString()   // Le nom doit être une chaîne de caractères
  filename: string;

  /**
   * Type MIME du fichier
   * @example 'application/pdf'
   */
  @ApiProperty({ description: 'Type MIME du fichier', example: 'application/pdf' })
  @IsNotEmpty() // Le type MIME ne peut pas être vide
  @IsString()   // Le type MIME doit être une chaîne de caractères
  mimeType: string;

  /**
   * Taille du fichier en octets
   * @example 1048576
   */
  @ApiProperty({ description: 'Taille du fichier en octets', example: 1048576 })
  @IsNotEmpty() // La taille ne peut pas être vide
  @IsNumber()   // La taille doit être un nombre
  size: number;

  /**
   * Chemin de stockage du fichier
   * @example 'uploads/2025/04/rapport_mensuel_123456.pdf'
   */
  @ApiProperty({ description: 'Chemin de stockage du fichier', example: 'uploads/2025/04/rapport_mensuel_123456.pdf' })
  @IsNotEmpty() // Le chemin ne peut pas être vide
  @IsString()   // Le chemin doit être une chaîne de caractères
  path: string;

  /**
   * ID de l'échéance associée à cette pièce jointe
   * @example '7a9d0f35-d562-4219-c732-d35cf1a2e5f9'
   */
  @ApiProperty({ 
    description: 'ID de l\'échéance associée', 
    example: '7a9d0f35-d562-4219-c732-d35cf1a2e5f9' 
  })
  @IsNotEmpty() // L'ID de l'échéance ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  deadlineId: string;

  /**
   * ID de l'utilisateur ayant ajouté la pièce jointe
   * @example '5f8d0f55-e477-4915-b522-c21ba1f70d9e'
   */
  @ApiProperty({ 
    description: 'ID de l\'utilisateur ayant ajouté la pièce jointe', 
    example: '5f8d0f55-e477-4915-b522-c21ba1f70d9e' 
  })
  @IsNotEmpty() // L'ID de l'uploader ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  uploaderId: string;

  /**
   * Niveau de classification du document (optionnel)
   * @example 'Confidentiel'
   */
  @ApiProperty({ 
    description: 'Niveau de classification du document', 
    required: false,
    example: 'Confidentiel' 
  })
  @IsOptional() // La classification est optionnelle
  @IsString()   // La classification doit être une chaîne de caractères
  classification?: string;
}