import React from 'react';
import { Modal } from '@/components/ui';
import DeadlineForm from '@/components/deadline/DeadlineForm';
import { Deadline } from '@/types';

/**
 * Props pour le composant EditDeadlineModal
 */
interface EditDeadlineModalProps {
  /** Si le modal est ouvert */
  isOpen: boolean;
  /** Fonction appelée à la fermeture du modal */
  onClose: () => void;
  /** Fonction appelée après succès de la mise à jour */
  onSuccess: () => void;
  /** Échéance à éditer */
  deadline: Deadline | null;
}

/**
 * Composant modal pour l'édition d'une échéance
 * @param props - Propriétés du composant
 * @returns Composant EditDeadlineModal
 */
export const EditDeadlineModal: React.FC<EditDeadlineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  deadline
}) => {
  return (
    <Modal
      isOpen={isOpen && !!deadline}
      onClose={onClose}
      title="Modifier l'échéance"
      size="lg"
    >
      {deadline && (
        <DeadlineForm
          deadline={deadline}
          onSuccess={() => {
            onClose();
            onSuccess();
          }}
          mode="edit"
        />
      )}
    </Modal>
  );
};