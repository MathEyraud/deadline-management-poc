/**
 * Data Transfer Object (DTO) pour la création d'un utilisateur
 * Définit et valide la structure des données entrantes lors de la création.
 * @module CreateUserDto
 */
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsEnum  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

/**
 * DTO pour la création d'un utilisateur
 * Définit et valide les données d'entrée pour la création d'utilisateurs
 */
export class CreateUserDto {
  /**
   * Prénom de l'utilisateur
   * @example 'Jean'
   */
  @ApiProperty({ description: 'Prénom', example: 'Jean' })
  @IsString() // Doit être une chaîne de caractères
  @IsNotEmpty() // Ne peut pas être vide
  @MaxLength(50) // Longueur maximale de 50 caractères
  firstName: string;

  /**
   * Nom de famille de l'utilisateur
   * @example 'Dupont'
   */
  @ApiProperty({ description: 'Nom', example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  /**
   * Email de l'utilisateur (utilisé comme identifiant de connexion)
   * @example 'jean.dupont@example.com'
   */
  @ApiProperty({ description: 'Email', example: 'jean.dupont@example.com' })
  @IsEmail() // Doit être un email valide
  @IsNotEmpty()
  email: string;

  /**
   * Mot de passe de l'utilisateur
   * @example 'P@ssw0rd123'
   */
  @ApiProperty({ description: 'Mot de passe', example: 'P@ssw0rd123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8) // Longueur minimale de 8 caractères
  password: string;

  /**
   * Rôle de l'utilisateur dans le système (optionnel)
   * Détermine les permissions et accès de l'utilisateur
   * @example UserRole.USER
   */
  @ApiProperty({ 
    description: 'Rôle de l\'utilisateur', 
    enum: UserRole,
    default: UserRole.USER,
    required: false
  })
  @IsOptional() // Le rôle est optionnel, USER par défaut si non spécifié
  @IsEnum(UserRole) // Le rôle doit être l'une des valeurs de l'énumération UserRole
  role?: UserRole;

  /**
   * Département ou équipe de l'utilisateur (optionnel)
   * @example 'Ingénierie'
   */
  @ApiProperty({ description: 'Département', required: false, example: 'Ingénierie' })
  @IsString()
  @IsOptional() // Champ optionnel
  department?: string;
}