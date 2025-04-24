/**
 * Page de vue tableau des échéances
 * Affiche toutes les échéances dans un format tabulaire avec tri et filtrage
 * @module app/dashboard/deadlines/table/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui';
import { Plus, ArrowLeftRight } from 'lucide-react';
import DeadlinesTable from '@/components/deadline/DeadlinesTable';
import FilterPanel from '@/components/deadline/FilterPanel';

/**
 * Page vue tableau des échéances
 * @returns Page avec tableau des échéances et options de filtrage
 */
export default function DeadlinesTablePage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Tableau des échéances"
        description="Visualisez et gérez toutes vos échéances dans un format tabulaire"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeftRight className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/deadlines')}
            >
              Vue liste
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/deadlines/create')}
            >
              Nouvelle échéance
            </Button>
          </div>
        }
      />

      {/* Panneau de filtrage */}
      <FilterPanel 
        isOpen={isFilterOpen} 
        onToggle={() => setIsFilterOpen(!isFilterOpen)} 
      />

      {/* Tableau des échéances */}
      <DeadlinesTable />
    </>
  );
}