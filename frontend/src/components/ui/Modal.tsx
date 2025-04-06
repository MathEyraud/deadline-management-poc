import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  /**
   * Indique si le modal est ouvert
   */
  isOpen: boolean;
  
  /**
   * Gestionnaire de fermeture du modal
   */
  onClose: () => void;
  
  /**
   * Titre du modal
   */
  title: string;
  
  /**
   * Contenu du modal
   */
  children: React.ReactNode;
  
  /**
   * Contenu du pied de page
   */
  footer?: React.ReactNode;
  
  /**
   * Largeur maximale du modal
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Composant Modal réutilisable pour afficher du contenu en superposition
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element | null} Composant Modal
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Fermer le modal en appuyant sur la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher le défilement de la page
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Restaurer le défilement
    };
  }, [isOpen, onClose]);
  
  // Fermer le modal en cliquant à l'extérieur
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Mapper la propriété maxWidth à une classe Tailwind
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };
  
  if (!isOpen) return null;
  
  // Utiliser createPortal pour rendre le modal en dehors de la hiérarchie DOM normale
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={handleOutsideClick}>
      <div ref={modalRef} className={`w-full ${maxWidthClasses[maxWidth]} bg-white rounded-lg shadow-xl overflow-hidden`}>
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Fermer"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Corps */}
        <div className="px-6 py-4">{children}</div>
        
        {/* Pied de page optionnel */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};