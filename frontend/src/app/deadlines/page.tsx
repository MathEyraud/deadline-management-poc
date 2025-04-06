import { Suspense } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeadlineList } from '@/components/deadline/DeadlineList';
import { DeadlineFilter } from '@/components/deadline/DeadlineFilter';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';

/**
 * Page listant toutes les échéances avec filtres
 * @returns {JSX.Element} Page liste des échéances
 */
export default function Deadlines() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader 
            title="Échéances" 
            description="Gérez et suivez toutes vos échéances" 
          />
          <Link href="/deadlines/create">
            <Button>Nouvelle échéance</Button>
          </Link>
        </div>
        
        {/* Filtres */}
        <DeadlineFilter />
        
        {/* Liste des échéances */}
        <div className="bg-white rounded-lg shadow">
          <Suspense fallback={<div>Chargement des échéances...</div>}>
            <DeadlineList />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
