/**
 * Composant PageHeader
 * En-tête de page standardisé avec titre, description et actions
 * @module components/layout/PageHeader
 */
import React, { ReactNode } from 'react';

/**
 * Props pour le composant PageHeader
 */
interface PageHeaderProps {
  /** Titre principal de la page */
  title: string;
  
  /** Description ou sous-titre de la page (optionnel) */
  description?: string;
  
  /** Actions à afficher à droite (boutons, etc.) */
  actions?: ReactNode;
}

/**
 * Composant PageHeader - En-tête standardisé pour les pages
 * @param props - Propriétés du composant
 * @returns Composant PageHeader
 */
export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;