/**
 * Data Transfer Object (DTO) pour la mise à jour d'un commentaire
 * Définit la structure des données entrantes lors de la mise à jour.
 * Hérite de CreateCommentDto mais rend toutes les propriétés optionnelles.
 * @module UpdateCommentDto
 */
import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

/**
 * DTO pour la mise à jour partielle d'un commentaire
 * Hérite de CreateCommentDto mais rend tous les champs optionnels (Partial)
 * Cela permet de mettre à jour uniquement les champs fournis
 */
export class UpdateCommentDto extends PartialType(CreateCommentDto) {}