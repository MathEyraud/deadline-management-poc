/**
 * Composant ConfirmDialog
 * Boîte de dialogue de confirmation pour les actions importantes
 * @module components/ui/ConfirmDialog
 */
import React from 'react';
import { Modal, Button } from '@/components/ui';

/**
 * Props pour le composant ConfirmDialog
 */
interface ConfirmDialogProps {
  /** Si la boîte de dialogue est ouverte */
  isOpen: boolean;
  /** Fonction appelée pour fermer la boîte de dialogue */
  onClose: () => void;
  /** Titre de la boîte de dialogue */
  title: string;
  /** Description ou message de la boîte de dialogue */
  description: string;
  /** Texte du bouton de confirmation */
  confirmLabel?: string;
  /** Texte du bouton d'annulation */
  cancelLabel?: string;
  /** Fonction appelée lors de la confirmation */
  onConfirm: () => void;
  /** Variante du bouton de confirmation */
  confirmVariant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  /** Si l'action est en cours d'exécution */
  isLoading?: boolean;
}

/**
 * Composant ConfirmDialog - Boîte de dialogue de confirmation
 * @param props - Propriétés du composant
 * @returns Composant ConfirmDialog
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-slate-700">
        {description}
      </p>
    </Modal>
  );
}