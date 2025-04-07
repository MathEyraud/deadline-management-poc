/**
 * Composant Modal personnalisé
 * Fenêtre modale réutilisable pour les dialogs
 * @module components/ui/Modal
 */
import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './Button';
import { XIcon } from 'lucide-react';

/**
 * Props pour le composant Modal
 */
export interface ModalProps {
  /** Titre de la modale */
  title?: string;
  /** Contenu de la modale */
  children: ReactNode;
  /** État d'ouverture de la modale */
  isOpen: boolean;
  /** Fonction pour fermer la modale */
  onClose: () => void;
  /** Affiche le bouton de fermeture dans le header si true */
  showCloseButton?: boolean;
  /** Taille de la modale */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Footer de la modale */
  footer?: ReactNode;
  /** Désactive la fermeture en cliquant sur le fond ou avec Escape */
  preventClose?: boolean;
}

/**
 * Composant Modal personnalisé
 * @param props - Propriétés de la modale
 * @returns Composant Modal
 */
export function Modal({
  title,
  children,
  isOpen,
  onClose,
  showCloseButton = true,
  size = 'md',
  footer,
  preventClose = false,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  // Fonction pour fermer la modale
  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Fond semi-transparent */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* Contenu de la modale */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className={`w-full ${sizes[size]} transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all`}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    {title && (
                      <Dialog.Title 
                        as="h3" 
                        className="text-lg font-medium text-slate-900"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    {showCloseButton && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose}
                        aria-label="Fermer"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Contenu */}
                <div className="p-6">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;