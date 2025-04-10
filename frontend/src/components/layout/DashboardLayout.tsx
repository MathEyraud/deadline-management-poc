/**
 * Composant DashboardLayout
 * Layout principal de l'application utilisé dans le App Router, intégrant navbar et sidebar
 * @module components/layout/DashboardLayout
 */
import React, { ReactNode, useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Props pour le composant DashboardLayout
 */
interface DashboardLayoutProps {
  /** Contenu à afficher dans le layout */
  children: ReactNode;
}

/**
 * Composant DashboardLayout - Structure principale de l'application
 * Inclut la barre de navigation, le sidebar et le contenu principal
 * @param props - Propriétés du composant
 * @returns Composant DashboardLayout
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirection si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Conserver la préférence de l'utilisateur dans le localStorage
  useEffect(() => {
    // Récupérer la préférence lors du chargement
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true');
      }
    }
  }, []);

  // Gestionnaire pour basculer l'état de collapse et sauvegarder la préférence
  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(newState));
    }
  };

  // Ne rien afficher pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ne rien afficher si non authentifié (la redirection se fera)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      
      {/* Contenu principal */}
      <div className="flex flex-col flex-1 min-h-screen">
        {/* Navbar */}
        <Navbar isSidebarCollapsed={sidebarCollapsed} />
        
        {/* Contenu de la page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;