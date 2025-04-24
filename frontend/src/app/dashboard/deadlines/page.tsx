/**
 * Page de liste des échéances
 * Affiche toutes les échéances avec options de filtrage et recherche
 * @module app/dashboard/deadlines/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  List,
  Table as TableIcon
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui';
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
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={viewMode === 'table' ? <List className="h-4 w-4" /> : <TableIcon className="h-4 w-4" />}
              onClick={() => setViewMode(viewMode === 'table' ? 'list' : 'table')}
            >
              {viewMode === 'table' ? 'Vue liste' : 'Vue tableau'}
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

      {/* Affiche la vue appropriée en fonction du mode */}
      {viewMode === 'table' ? <DeadlinesTable /> : <DeadlinesList />}
    </>
  );
}