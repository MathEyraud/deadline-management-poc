'use client';

import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeadlineOverview } from '@/components/dashboard/DeadlineOverview';
import { DeadlineChart } from '@/components/dashboard/DeadlineChart';
import { DeadlineMetrics } from '@/components/dashboard/DeadlineMetrics';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Page d'accueil qui sert de tableau de bord principal
 * @returns {JSX.Element} Page d'accueil avec tableau de bord
 */
export default function Home() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <PageHeader 
          title="Tableau de bord" 
          description="Vue d'ensemble des échéances et des tâches" 
        />
        
        {/* Métriques principales */}
        <Suspense fallback={<div>Chargement des métriques...</div>}>
          <DeadlineMetrics />
        </Suspense>
        
        {/* Graphiques de répartition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<div>Chargement des graphiques...</div>}>
            <DeadlineChart type="priority" />
          </Suspense>
          <Suspense fallback={<div>Chargement des graphiques...</div>}>
            <DeadlineChart type="status" />
          </Suspense>
        </div>
        
        {/* Vue d'ensemble des échéances imminentes */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Échéances imminentes</h2>
          <Suspense fallback={<div>Chargement des échéances...</div>}>
            <DeadlineOverview limit={5} />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}