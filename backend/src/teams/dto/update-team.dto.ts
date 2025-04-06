/**
 * Data Transfer Object (DTO) pour la mise à jour d'une équipe
 * Définit la structure des données entrantes lors de la mise à jour.
 * Hérite de CreateTeamDto mais rend toutes les propriétés optionnelles.
 * @module UpdateTeamDto
 */
import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';

/**
 * DTO pour la mise à jour partielle d'une équipe
 * Hérite de CreateTeamDto mais rend tous les champs optionnels (Partial)
 * Cela permet de mettre à jour uniquement les champs fournis
 */
export class UpdateTeamDto extends PartialType(CreateTeamDto) {}