/**
 * Data Transfer Object (DTO) pour la création d'une équipe
 * Définit et valide la structure des données entrantes lors de la création.
 * @module CreateTeamDto
 */
import { IsNotEmpty, IsString, IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO pour la création d'une équipe
 * Définit et valide les données d'entrée pour la création d'équipes
 */
export class CreateTeamDto {
  /**
   * Nom de l'équipe
   * @example 'Équipe Cybersécurité'
   */
  @ApiProperty({ description: 'Nom de l\'équipe', example: 'Équipe Cybersécurité' })
  @IsNotEmpty() // Le nom ne peut pas être vide
  @IsString()   // Le nom doit être une chaîne de caractères
  name: string;

  /**
   * Description détaillée de l'équipe (optionnelle)
   * @example 'Équipe responsable de la sécurité des systèmes d\'information'
   */
  @ApiProperty({ 
    description: 'Description détaillée de l\'équipe', 
    required: false,
    example: 'Équipe responsable de la sécurité des systèmes d\'information' 
  })
  @IsOptional() // La description est optionnelle
  @IsString()   // La description doit être une chaîne de caractères
  description?: string;

  /**
   * ID de l'utilisateur chef d'équipe
   * @example '5f8d0f55-e477-4915-b522-c21ba1f70d9e'
   */
  @ApiProperty({ 
    description: 'ID de l\'utilisateur chef d\'équipe', 
    example: '5f8d0f55-e477-4915-b522-c21ba1f70d9e' 
  })
  @IsNotEmpty() // L'ID du chef d'équipe ne peut pas être vide
  @IsUUID()     // L'ID doit être un UUID valide
  leaderId: string;

  /**
   * Liste des IDs des membres de l'équipe
   * @example ['7a9d0f35-d562-4219-c732-d35cf1a2e5f9', '3e7d0f55-e987-4215-c382-a56cf1a2e4d8']
   */
  @ApiProperty({ 
    description: 'Liste des IDs des membres de l\'équipe', 
    type: [String],
    example: ['7a9d0f35-d562-4219-c732-d35cf1a2e5f9', '3e7d0f55-e987-4215-c382-a56cf1a2e4d8']
  })
  @IsArray()    // Doit être un tableau
  @IsUUID(undefined, { each: true }) // Chaque élément doit être un UUID valide
  memberIds: string[];

  /**
   * Département auquel l'équipe appartient (optionnel)
   * @example 'R&D'
   */
  @ApiProperty({ 
    description: 'Département auquel l\'équipe appartient', 
    required: false,
    example: 'R&D' 
  })
  @IsOptional() // Le département est optionnel
  @IsString()   // Le département doit être une chaîne de caractères
  department?: string;
}