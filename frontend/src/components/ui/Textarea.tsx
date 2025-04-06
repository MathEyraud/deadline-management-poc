'use client';

import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Message d'erreur à afficher
   */
  error?: string;
}

/**
 * Composant Textarea réutilisable avec gestion des erreurs
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Textarea
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    // Styles de base pour tous les textareas
    const baseStyles = 'w-full px-3 py-2 border rounded-md text-sm';
    
    // Appliquer des styles spécifiques selon qu'il y a une erreur ou non
    const statusStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    // Assembler toutes les classes CSS
    const textareaStyles = `${baseStyles} ${statusStyles} ${className}`;
    
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={textareaStyles}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

// Définir un nom d'affichage pour les DevTools React
Textarea.displayName = 'Textarea';
