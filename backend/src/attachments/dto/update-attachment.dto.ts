/**
 * Data Transfer Object (DTO) pour la mise à jour d'une pièce jointe
 * Définit la structure des données entrantes lors de la mise à jour.
 * Hérite de CreateAttachmentDto mais rend toutes les propriétés optionnelles.
 * @module UpdateAttachmentDto
 */
import { PartialType } from '@nestjs/swagger';
import { CreateAttachmentDto } from './create-attachment.dto';

/**
 * DTO pour la mise à jour partielle d'une pièce jointe
 * Hérite de CreateAttachmentDto mais rend tous les champs optionnels (Partial)
 * Cela permet de mettre à jour uniquement les champs fournis
 */
export class UpdateAttachmentDto extends PartialType(CreateAttachmentDto) {}