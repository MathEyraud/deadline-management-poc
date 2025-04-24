// Modification du composant Sidebar pour corriger les chemins
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
  BarChart2,
  ChevronLeft,
  Table
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const pathname = usePathname();

  // Définition des liens de navigation
  const navigationLinks = [
    {
      title: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Échéances',
      href: '/dashboard/deadlines',
      icon: ListTodo,
    },
    {
      title: 'Vue Tableau',
      href: '/dashboard/deadlines/table',
      icon: Table,
    },
    {
      title: 'Calendrier',
      href: '/dashboard/calendar',
      icon: Calendar,
    },
    {
      title: 'Projets',
      href: '/dashboard/projects',
      icon: FolderKanban,
    },
    {
      title: 'Équipes',
      href: '/dashboard/teams',
      icon: Users,
    },
    {
      title: 'Chat IA',
      href: '/chat',
      icon: MessageSquareText,
    },
    {
      title: 'Rapports',
      href: '/dashboard/reports',
      icon: BarChart2,
    },
  ];

  // Déterminer si un lien est actif
  const isLinkActive = (href: string) => {
    if (!pathname) {
      return false;
    }
    
    // Exact match pour la page d'accueil
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // Prefix match pour les autres pages
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  // Détermine la largeur de la sidebar en fonction de son état
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <aside
      id="sidebar"
      className={cn(
        `h-screen ${sidebarWidth} bg-white border-r border-slate-200 pt-16 
         transition-all duration-300 ease-in-out flex flex-col sticky top-0 left-0`
      )}
    >
      {/* Bouton pour réduire/étendre la sidebar (en bas à droite) */}
      <div className="absolute right-2 top-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="p-1"
          aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
        >
          <ChevronLeft className={cn(
            "h-5 w-5 text-slate-500 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-grow">
        <div className="space-y-1">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100",
                isLinkActive(link.href) 
                  ? "bg-slate-100 text-blue-600" 
                  : "text-slate-700",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? link.title : undefined}
            >
              <link.icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
              {!isCollapsed && <span>{link.title}</span>}
            </Link>
          ))}
        </div>

        <div className={cn("pt-4 border-t border-slate-200", isCollapsed ? "flex justify-center" : "")}>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100",
              pathname === '/dashboard/settings' 
                ? "bg-slate-100 text-blue-600" 
                : "text-slate-700",
              isCollapsed ? "justify-center" : ""
            )}
            title={isCollapsed ? "Paramètres" : undefined}
          >
            <Settings className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span>Paramètres</span>}
          </Link>
        </div>
      </div>

      {/* Footer with app version */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && <span className="text-xs text-slate-500">v1.0.0</span>}
          {isCollapsed ? (
            <span className="text-xs text-slate-500">v1.0</span>
          ) : (
            <span className="text-xs text-slate-500">DeadlineManager</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;