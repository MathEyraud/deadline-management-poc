/**
 * Page de création d'une échéance
 * Formulaire pour créer une nouvelle échéance
 * @module app/dashboard/deadlines/create/page
 */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, Button } from '@/components/ui';
import { DeadlineForm } from '@/components/deadline/DeadlineForm';
import { ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/app/providers';

/**
 * Page de création d'une échéance
 * @returns Page avec formulaire de création
 */
export default function CreateDeadlinePage() {
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  // Fonction pour gérer le succès de la création
  const handleSuccess = () => {
    showNotification('Échéance créée avec succès', 'success');
    router.push('/dashboard/deadlines');
  };
  
  return (
    <>
      <PageHeader
        title="Créer une échéance"
        description="Ajoutez une nouvelle échéance au système"
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push('/dashboard/deadlines')}
          >
            Retour
          </Button>
        }
      />
      
      <Card>
        <CardContent className="p-6">
          <DeadlineForm 
            mode="create"
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </>
  );
}