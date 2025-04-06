'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

/**
 * Layout principal pour les pages du tableau de bord et autres pages après connexion
 * @param {Object} props - Propriétés du composant
 * @param {ReactNode} props.children - Contenu à afficher dans le layout
 * @returns {JSX.Element} Layout avec barre de navigation, sidebar et footer
 */
export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};