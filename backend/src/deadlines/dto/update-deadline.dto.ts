/**
 * Data Transfer Object (DTO) pour la mise à jour d'une échéance
 * Définit la structure des données entrantes lors de la mise à jour.
 * Étend CreateDeadlineDto mais rend toutes les propriétés optionnelles.
 * @module UpdateDeadlineDto
 */
import { PartialType } from '@nestjs/swagger';
import { CreateDeadlineDto } from './create-deadline.dto';

/**
 * DTO pour la mise à jour partielle d'une échéance
 * Hérite de CreateDeadlineDto mais rend tous les champs optionnels (Partial)
 * Cela permet de mettre à jour uniquement les champs fournis
 */
export class UpdateDeadlineDto extends PartialType(CreateDeadlineDto) {}