/**
 * Composant Sidebar
 * Barre latérale de navigation avec liens vers les différentes sections
 * @module components/layout/Sidebar
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  Users, 
  FolderKanban, 
  MessageSquareText,
  Settings,
  BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props du composant Sidebar
 */
interface SidebarProps {
  /** Indique si la sidebar est ouverte */
  isOpen: boolean;
  /** Fonction pour fermer la sidebar */
  onClose: () => void;
}

/**
 * Définition des liens de navigation
 */
const navigationLinks = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Échéances',
    href: '/deadlines',
    icon: ListTodo,
  },
  {
    title: 'Calendrier',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Projets',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Équipes',
    href: '/teams',
    icon: Users,
  },
  {
    title: 'Chat IA',
    href: '/chat',
    icon: MessageSquareText,
  },
  {
    title: 'Rapports',
    href: '/reports',
    icon: BarChart2,
  },
];

/**
 * Composant Sidebar - Barre latérale de navigation
 * @param props - Propriétés du composant
 * @returns Composant Sidebar
 */
export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  // Déterminer si un lien est actif
  const isLinkActive = (href: string) => {
    if (!pathname) {
      return false; // Si pathname est null, retourne false
    }
    
    // Exact match pour la page d'accueil
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // Prefix match pour les autres pages
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  // Handle click outside on mobile to close sidebar
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside sidebar and sidebar is open on mobile
      if (isOpen && window.innerWidth < 1024 && !target.closest('#sidebar')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 pt-16 z-10 transition-transform duration-300 ease-in-out transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-4">
          <div className="space-y-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100",
                  isLinkActive(link.href) 
                    ? "bg-slate-100 text-blue-600" 
                    : "text-slate-700"
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
              >
                <link.icon className="h-5 w-5 mr-3" />
                {link.title}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <Link
              href="/settings"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100",
                pathname === '/settings' 
                  ? "bg-slate-100 text-blue-600" 
                  : "text-slate-700"
              )}
            >
              <Settings className="h-5 w-5 mr-3" />
              Paramètres
            </Link>
          </div>

          {/* Footer with app version */}
          <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">v1.0.0</span>
              <span className="text-xs text-slate-500">DeadlineManager</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;