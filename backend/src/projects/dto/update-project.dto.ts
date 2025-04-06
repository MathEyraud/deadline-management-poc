/**
 * Data Transfer Object (DTO) pour la mise à jour d'un projet
 * Définit la structure des données entrantes lors de la mise à jour.
 * Hérite de CreateProjectDto mais rend toutes les propriétés optionnelles.
 * @module UpdateProjectDto
 */
import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

/**
 * DTO pour la mise à jour partielle d'un projet
 * Hérite de CreateProjectDto mais rend tous les champs optionnels (Partial)
 * Cela permet de mettre à jour uniquement les champs fournis
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}