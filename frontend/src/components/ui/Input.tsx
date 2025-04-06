'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Message d'erreur à afficher
   */
  error?: string;
}

/**
 * Composant Input réutilisable avec gestion des erreurs
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Input
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    // Styles de base pour tous les inputs
    const baseStyles = 'w-full px-3 py-2 border rounded-md text-sm';
    
    // Appliquer des styles spécifiques selon qu'il y a une erreur ou non
    const statusStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    // Assembler toutes les classes CSS
    const inputStyles = `${baseStyles} ${statusStyles} ${className}`;
    
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={inputStyles}
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
Input.displayName = 'Input';
