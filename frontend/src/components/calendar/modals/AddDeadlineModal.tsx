import React from 'react';
import { Modal } from '@/components/ui';
import DeadlineForm from '@/components/deadline/DeadlineForm';

/**
 * Props pour le composant AddDeadlineModal
 */
interface AddDeadlineModalProps {
  /** Si le modal est ouvert */
  isOpen: boolean;
  /** Fonction appelée à la fermeture du modal */
  onClose: () => void;
  /** Fonction appelée après succès de la création */
  onSuccess: () => void;
  /** Date initiale pour la nouvelle échéance */
  initialDate?: Date;
  /** ID du projet initial (optionnel) */
  initialProjectId?: string;
}

/**
 * Composant modal pour l'ajout d'une échéance
 * @param props - Propriétés du composant
 * @returns Composant AddDeadlineModal
 */
export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialProjectId
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer une nouvelle échéance"
      size="lg"
    >
      <DeadlineForm
        onSuccess={() => {
          onClose();
          onSuccess();
        }}
        mode="create"
        initialProjectId={initialProjectId}
      />
    </Modal>
  );
};