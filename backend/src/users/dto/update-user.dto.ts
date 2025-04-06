/**
 * Data Transfer Object (DTO) pour la mise à jour d'un utilisateur
 * Définit la structure des données entrantes lors de la mise à jour.
 * Hérite de CreateUserDto mais rend toutes les propriétés optionnelles.
 * @module UpdateUserDto
 */
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO pour la mise à jour partielle d'un utilisateur
 * Hérite de CreateUserDto mais rend tous les champs optionnels (Partial)
 * Cela permet de mettre à jour uniquement les champs fournis
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}