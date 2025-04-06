/**
 * Data Transfer Object (DTO) pour la création d'une échéance
 * Définit et valide la structure des données entrantes lors de la création.
 * @module CreateDeadlineDto
 */
import { IsNotEmpty, IsString, IsDate, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeadlinePriority, DeadlineStatus, DeadlineVisibility } from '../entities/deadline.entity';

/**
 * DTO pour la création d'une échéance
 * Utilisé pour valider les données d'entrée lors de la création
 */
export class CreateDeadlineDto {
  /**
   * Titre de l'échéance
   * @example 'Réunion de projet'
   */
  @ApiProperty({ description: 'Titre de l\'échéance', example: 'Réunion de projet' })
  @IsNotEmpty() // Le titre ne peut pas être vide
  @IsString()   // Le titre doit être une chaîne de caractères
  title: string;

  /**
   * Description détaillée de l'échéance (optionnelle)
   * @example 'Discuter des avancées du projet XYZ'
   */
  @ApiProperty({ description: 'Description détaillée', example: 'Discuter des avancées du projet XYZ' })
  @IsOptional() // La description est optionnelle
  @IsString()   // La description doit être une chaîne de caractères
  description?: string;

  /**
   * Date et heure de l'échéance
   * @example '2025-05-15T14:00:00.000Z'
   */
  @ApiProperty({ description: 'Date et heure de l\'échéance', example: '2025-05-15T14:00:00.000Z' })
  @IsNotEmpty() // La date ne peut pas être vide
  @IsDate()     // La valeur doit être une date valide
  @Type(() => Date) // Transformation automatique en objet Date
  deadlineDate: Date;

  /**
   * ID de l'utilisateur créateur de l'échéance
   * @example '5f8d0f55-e477-4915-b522-c21ba1f70d9e'
   */
  @ApiProperty({ description: 'ID de l\'utilisateur créateur', example: '5f8d0f55-e477-4915-b522-c21ba1f70d9e' })
  @IsNotEmpty() // L'ID du créateur ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  creatorId: string;

  /**
   * Priorité de l'échéance
   * @example DeadlinePriority.MEDIUM
   */
  @ApiProperty({ 
    description: 'Priorité de l\'échéance', 
    enum: DeadlinePriority,
    example: DeadlinePriority.MEDIUM
  })
  @IsEnum(DeadlinePriority) // La valeur doit être l'une des valeurs de l'énumération
  priority: DeadlinePriority;

  /**
   * Statut de l'échéance
   * @example DeadlineStatus.NEW
   */
  @ApiProperty({ 
    description: 'Statut de l\'échéance', 
    enum: DeadlineStatus,
    example: DeadlineStatus.NEW
  })
  @IsEnum(DeadlineStatus) // La valeur doit être l'une des valeurs de l'énumération
  status: DeadlineStatus;

  /**
   * Visibilité de l'échéance
   * @example DeadlineVisibility.TEAM
   */
  @ApiProperty({ 
    description: 'Visibilité de l\'échéance', 
    enum: DeadlineVisibility,
    example: DeadlineVisibility.TEAM
  })
  @IsEnum(DeadlineVisibility) // La valeur doit être l'une des valeurs de l'énumération
  visibility: DeadlineVisibility;

  /**
   * ID du projet associé (optionnel)
   * @example '7a9d0f35-d562-4219-c732-d35cf1a2e5f9'
   */
  @ApiProperty({ 
    description: 'ID du projet associé (optionnel)', 
    required: false,
    example: '7a9d0f35-d562-4219-c732-d35cf1a2e5f9'
  })
  @IsOptional() // L'ID du projet est optionnel
  @IsUUID()     // Si fourni, l'ID doit être un UUID valide
  projectId?: string;
}