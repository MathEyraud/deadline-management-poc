/**
 * Page du calendrier des échéances
 * Affiche un calendrier interactif avec les échéances
 * @module app/calendar/page
 */
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import Modal from '@/components/ui/Modal';
import DeadlineForm from '@/components/deadline/DeadlineForm';
import { useDeadlinesList } from '@/hooks/useDeadlines';

/**
 * Page Calendar
 * Calendrier interactif des échéances
 * @returns Page Calendar
 */
export default function CalendarPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { refetch } = useDeadlinesList();
  
  return (
    <DashboardLayout>
      <PageHeader
        title="Calendrier"
        description="Visualisez vos échéances dans un calendrier interactif"
        actions={
          <Button 
            variant="primary" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nouvelle échéance
          </Button>
        }
      />
      
      <CalendarView />
      
      {/* Modal pour créer une échéance */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Créer une nouvelle échéance"
        size="lg"
      >
        <DeadlineForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
          mode="create"
        />
      </Modal>
    </DashboardLayout>
  );
}