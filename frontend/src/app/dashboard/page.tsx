'use client';

import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeadlineMetrics } from '@/components/dashboard/DeadlineMetrics';
import { DeadlineChart } from '@/components/dashboard/DeadlineChart';
import { DeadlineOverview } from '@/components/dashboard/DeadlineOverview';

/**
 * Page principale du tableau de bord
 * @returns {JSX.Element} Page d'accueil avec dashboard
 */
export default function Home() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tableau de bord" 
        description="Vue d'ensemble des échéances et des projets"
      />
      
      {/* Métriques principales */}
      <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>}>
        <DeadlineMetrics />
      </Suspense>
      
      {/* Graphiques de répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
          <DeadlineChart type="priority" />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
          <DeadlineChart type="status" />
        </Suspense>
      </div>
      
      {/* Vue d'ensemble des échéances imminentes */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Échéances imminentes</h2>
        <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
          <DeadlineOverview limit={5} />
        </Suspense>
      </div>
    </div>
  );
}
