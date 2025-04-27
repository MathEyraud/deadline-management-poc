/**
 * Composant Modal personnalisé
 * Fenêtre modale réutilisable avec fond semi-transparent
 * @module components/ui/Modal
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  /** Niveau d'opacité du fond (0-100) */
  backdropOpacity?: number;
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
  backdropOpacity = 50,
}: ModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Gestion de l'animation d'entrée/sortie
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Gestion de la touche Escape pour fermer la modale
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !preventClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, preventClose]);
  
  // Effet pour gérer l'animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Durée de l'animation en ms
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Fermeture de la modale
  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };
  
  // Interrompre les clics sur le contenu de la modale
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // Définir les classes en fonction de la taille
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };
  
  // Si le composant n'est pas encore monté ou si la modale n'est pas ouverte et n'est pas en animation
  if (!isMounted || (!isOpen && !isAnimating)) {
    return null;
  }
  
  // Créer le style pour le fond avec l'opacité personnalisée
  const backdropStyle = {
    backgroundColor: `rgba(0, 0, 0, ${backdropOpacity / 100})`,
  };
  
  const modal = (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto",
        isOpen ? "animate-fade-in" : "animate-fade-out"
      )}
    >
      {/* Fond semi-transparent */}
      <div 
        className="absolute inset-0 backdrop-blur-sm transition-opacity"
        style={backdropStyle}
        onClick={handleClose}
      />
      
      {/* Contenu de la modale */}
      <div 
        className={cn(
          `w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all`,
          isOpen ? "animate-modal-in" : "animate-modal-out"
        )}
        onClick={handleContentClick}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            {title && (
              <h3 className="text-lg font-medium text-slate-900">
                {title}
              </h3>
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
      </div>
    </div>
  );
  
  // Utilisation de createPortal pour rendre la modale à la fin du document
  return createPortal(modal, document.body);
}

export default Modal;