/**
 * Data Transfer Object (DTO) pour la création d'un projet
 * Définit et valide la structure des données entrantes lors de la création.
 * @module CreateProjectDto
 */
import { IsNotEmpty, IsString, IsDate, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

/**
 * DTO pour la création d'un projet
 * Définit et valide les données d'entrée pour la création de projets
 */
export class CreateProjectDto {
  /**
   * Nom du projet
   * @example 'Projet Alpha'
   */
  @ApiProperty({ description: 'Nom du projet', example: 'Projet Alpha' })
  @IsNotEmpty() // Le nom ne peut pas être vide
  @IsString()   // Le nom doit être une chaîne de caractères
  name: string;

  /**
   * Description détaillée du projet (optionnelle)
   * @example 'Développement d\'un système de communication sécurisé'
   */
  @ApiProperty({ 
    description: 'Description détaillée du projet', 
    required: false,
    example: 'Développement d\'un système de communication sécurisé' 
  })
  @IsOptional() // La description est optionnelle
  @IsString()   // La description doit être une chaîne de caractères
  description?: string;

  /**
   * Date de début du projet
   * @example '2025-01-01'
   */
  @ApiProperty({ description: 'Date de début du projet', example: '2025-01-01' })
  @IsNotEmpty() // La date de début ne peut pas être vide
  @IsDate()     // La valeur doit être une date valide
  @Type(() => Date) // Transformation automatique en objet Date
  startDate: Date;

  /**
   * Date de fin prévue du projet (optionnelle)
   * @example '2025-06-30'
   */
  @ApiProperty({ 
    description: 'Date de fin prévue du projet', 
    required: false,
    example: '2025-06-30' 
  })
  @IsOptional() // La date de fin est optionnelle
  @IsDate()     // La valeur doit être une date valide
  @Type(() => Date) // Transformation automatique en objet Date
  endDate?: Date;

  /**
   * ID de l'utilisateur responsable du projet
   * @example '5f8d0f55-e477-4915-b522-c21ba1f70d9e'
   */
  @ApiProperty({ 
    description: 'ID de l\'utilisateur responsable', 
    example: '5f8d0f55-e477-4915-b522-c21ba1f70d9e' 
  })
  @IsNotEmpty() // L'ID du responsable ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  managerId: string;

  /**
   * Statut du projet
   * @example 'ProjectStatus.PLANNING'
   */
  @ApiProperty({ 
    description: 'Statut du projet', 
    enum: ProjectStatus,
    example: ProjectStatus.PLANNING
  })
  @IsEnum(ProjectStatus) // La valeur doit être l'une des valeurs de l'énumération
  status: ProjectStatus;

  /**
   * Niveau de sécurité ou classification du projet (optionnel)
   * @example 'Confidentiel'
   */
  @ApiProperty({ 
    description: 'Niveau de sécurité ou classification', 
    required: false,
    example: 'Confidentiel' 
  })
  @IsOptional() // Le niveau de sécurité est optionnel
  @IsString()   // Le niveau de sécurité doit être une chaîne de caractères
  securityLevel?: string;

  /**
   * ID de l'équipe associée au projet (optionnel)
   * @example '7a9d0f35-d562-4219-c732-d35cf1a2e5f9'
   */
  @ApiProperty({ 
    description: 'ID de l\'équipe associée (optionnel)', 
    required: false,
    example: '7a9d0f35-d562-4219-c732-d35cf1a2e5f9' 
  })
  @IsOptional() // L'ID de l'équipe est optionnel
  @IsUUID()     // Si fourni, l'ID doit être un UUID valide
  teamId?: string;
}