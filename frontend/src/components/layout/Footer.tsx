'use client';

import React from 'react';

/**
 * Composant de pied de page pour l'application
 * @returns {JSX.Element} Pied de page de l'application
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              &copy; {currentYear} Application de Gestion d'Échéances - Secteur Défense
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-300 hover:text-white text-sm">
              Confidentialité
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm">
              Aide
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400 text-center">
          <p>Version POC 1.0 - Application sécurisée pour environnement de défense</p>
        </div>
      </div>
    </footer>
  );
};