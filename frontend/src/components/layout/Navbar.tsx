/**
 * Composant de barre de navigation principale
 * Affiche la barre de navigation supérieure avec logo, titre, et actions utilisateur
 * @module components/layout/Navbar
 */
import React from 'react';
import Link from 'next/link';
import { 
  Menu, 
  BellIcon, 
  UserCircle, 
  LogOut, 
  Settings, 
  ChevronDown,
  CalendarIcon,
  ListTodoIcon,
  LayoutDashboardIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/hooks/useAuth';

/**
 * Props du composant Navbar
 */
interface NavbarProps {
  /** Fonction pour ouvrir/fermer le sidebar */
  toggleSidebar?: () => void;
  /** Indique si le sidebar est ouvert */
  isSidebarOpen?: boolean;
}

/**
 * Composant Navbar - Barre de navigation supérieure de l'application
 * @param props - Propriétés du composant
 * @returns Composant Navbar
 */
export const Navbar = ({ toggleSidebar, isSidebarOpen }: NavbarProps) => {
  const { user, logout } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Section gauche - Logo et bouton du menu */}
          <div className="flex items-center">
            {/* Bouton pour le menu latéral (visible sur mobile/tablette) */}
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Logo et titre */}
            <Link href="/dashboard" className="flex items-center">
              <span className="text-slate-900 font-bold text-xl">DeadlineManager</span>
            </Link>
            
            {/* Navigation principale (visible sur grands écrans) */}
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
              <Link 
                href="/dashboard" 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboardIcon className="h-4 w-4 mr-2" />
                Tableau de bord
              </Link>
              <Link 
                href="/deadlines" 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
              >
                <ListTodoIcon className="h-4 w-4 mr-2" />
                Échéances
              </Link>
              <Link 
                href="/calendar" 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendrier
              </Link>
            </nav>
          </div>
          
          {/* Section droite - Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Notification (visible sur tous les écrans) */}
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
                    href="/settings" 
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
      </div>
    </header>
  );
};

export default Navbar;