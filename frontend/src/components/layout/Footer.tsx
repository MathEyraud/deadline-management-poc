/**
 * Composant Footer
 * Pied de page de l'application
 * @module components/layout/Footer
 */
import React from 'react';
import Link from 'next/link';

/**
 * Composant Footer - Pied de page de l'application
 * @returns Composant Footer
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-slate-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-slate-500">
              &copy; {currentYear} DeadlineManager. Tous droits réservés.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link 
              href="/help" 
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Aide
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Confidentialité
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;