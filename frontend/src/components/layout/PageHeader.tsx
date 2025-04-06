'use client';

import React from 'react';

interface PageHeaderProps {
  /**
   * Titre de la page
   */
  title: string;
  
  /**
   * Description ou sous-titre optionnel
   */
  description?: string;
  
  /**
   * Actions supplémentaires à afficher (boutons, etc.)
   */
  actions?: React.ReactNode;
}

/**
 * Composant d'en-tête de page standardisé
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} En-tête de page avec titre, description et actions
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="mt-4 md:mt-0 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};