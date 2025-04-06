'use client';

import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Message d'erreur à afficher
   */
  error?: string;
  
  /**
   * Contenu du select (options)
   */
  children: React.ReactNode;
}

/**
 * Composant Select réutilisable avec gestion des erreurs
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} Composant Select
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    // Styles de base pour tous les selects
    const baseStyles = 'w-full px-3 py-2 border rounded-md text-sm appearance-none bg-white';
    
    // Appliquer des styles spécifiques selon qu'il y a une erreur ou non
    const statusStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    // Assembler toutes les classes CSS
    const selectStyles = `${baseStyles} ${statusStyles} ${className}`;
    
    return (
      <div className="w-full relative">
        <select
          ref={ref}
          className={selectStyles}
          {...props}
        >
          {children}
        </select>
        {/* Flèche de dropdown personnalisée */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

// Définir un nom d'affichage pour les DevTools React
Select.displayName = 'Select';