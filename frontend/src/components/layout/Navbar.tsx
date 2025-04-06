'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Barre de navigation principale de l'application
 * @returns {JSX.Element} Composant de barre de navigation
 */
export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fonction factice pour simuler la déconnexion
  const handleLogout = () => {
    console.log("Déconnexion");
    // Dans une implémentation réelle, cette fonction utiliserait useAuth()
    // Pour le POC, nous simulons simplement la présence d'un utilisateur
  };
  
  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo et titre pour mobile */}
          <div className="flex items-center md:hidden">
            <button 
              className="text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
            <Link href="/" className="ml-3 font-bold text-xl">
              <span className="text-blue-400">GE</span> Défense
            </Link>
          </div>
          
          {/* Menu de recherche et notifications */}
          <div className="hidden md:flex items-center w-full max-w-xs ml-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-1 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Liens, notifications et profil */}
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-gray-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
            </button>
            
            <span className="text-sm mr-2 hidden md:inline-block">
              Utilisateur POC
            </span>
            
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Tableau de bord
              </Link>
              <Link href="/calendar" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Calendrier
              </Link>
              <Link href="/deadlines" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Échéances
              </Link>
              <Link href="/chat" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Chat IA
              </Link>
              <Link href="/settings" className="text-white hover:bg-gray-800 px-3 py-2 rounded-md">
                Paramètres
              </Link>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="relative w-full mb-3">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};