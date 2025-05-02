/**
 * Composant de barre de navigation principale
 * Affiche la barre de navigation supérieure avec logo, titre, et actions utilisateur
 * @module components/layout/Navbar
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BellIcon, 
  UserCircle, 
  LogOut, 
  Settings, 
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { GlobalSearch } from '@/components/search';

/**
 * Props du composant Navbar
 */
interface NavbarProps {
  /** Indique si le sidebar est en mode réduit (icônes uniquement) */
  isSidebarCollapsed?: boolean;
}

/**
 * Composant Navbar - Barre de navigation supérieure de l'application
 * @param props - Propriétés du composant
 * @returns Composant Navbar
 */
export const Navbar = ({ isSidebarCollapsed }: NavbarProps) => {
  const { user, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Section gauche - Logo et titre */}
          <div className="flex items-center">
            {/* Logo et titre */}
            <Link href="/dashboard" className="flex items-center">
              <span className="text-slate-900 font-bold text-xl">DeadlineManager</span>
            </Link>
          </div>
          
          {/* Section droite - Actions utilisateur avec recherche */}
          <div className="flex items-center space-x-4">
            {/* Recherche globale */}
            <div className="w-64 hidden md:block">
              <GlobalSearch />
            </div>
            
            {/* Notification */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </Button>
            
            {/* Menu utilisateur */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <UserCircle className="h-6 w-6 mr-1" />
                <span className="hidden md:block">{user?.firstName || 'Utilisateur'}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              
              {/* Contenu du menu déroulant */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-40"
                  onBlur={() => setIsMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  
                  <Link 
                    href="/dashboard/settings" 
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>
                  
                  <button 
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 w-full text-left"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Barre de recherche mobile (visible uniquement sur petit écran) */}
        <div className="block md:hidden pb-2">
          <GlobalSearch />
        </div>
      </div>
    </header>
  );
};

export default Navbar;