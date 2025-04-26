/**
 * Page de liste des échéances
 * Affiche toutes les échéances avec options de filtrage et recherche
 * @module app/dashboard/deadlines/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ViewToggle } from '@/components/ui';
import { useDeadlineContext } from '@/contexts/DeadlineContext';
import DeadlinesTable from '@/components/deadline/DeadlinesTable';
import FilterPanel from '@/components/deadline/FilterPanel';
import DeadlinesList from '@/components/deadline/DeadlinesList';

/**
 * Page de liste des échéances
 * @returns Page affichant toutes les échéances avec filtres
 */
export default function DeadlinesPage() {
  const router = useRouter();
  const { viewMode, setViewMode } = useDeadlineContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  return (
    <>
      <PageHeader
        title="Échéances"
        description="Consultez et gérez toutes vos échéances"
        actions={
          <div className="flex items-center space-x-2">
            <ViewToggle 
              activeView={viewMode} 
              onViewChange={setViewMode} 
            />
            <Button
              variant="primary"
              className="whitespace-nowrap"
              onClick={() => router.push('/dashboard/deadlines/create')}
            >
              <Plus className="h-4 w-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Nouvelle échéance</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>
        }
      />

      {/* Panneau de filtrage */}
      <FilterPanel 
        isOpen={isFilterOpen} 
        onToggle={() => setIsFilterOpen(!isFilterOpen)} 
      />

      {/* Affiche la vue appropriée en fonction du mode */}
      {viewMode === 'table' ? <DeadlinesTable /> : <DeadlinesList />}
    </>
  );
}