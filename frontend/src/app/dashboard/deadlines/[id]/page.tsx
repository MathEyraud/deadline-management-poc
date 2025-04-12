/**
 * Page de détail d'une échéance
 * Affiche les informations détaillées d'une échéance
 * @module app/dashboard/deadlines/[id]/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Badge, Modal } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useDeadline, useDeadlineMutations } from '@/hooks/useDeadlines';
import { Edit, Trash2, ArrowLeft, Clock, Calendar } from 'lucide-react';
import { DeadlinePriority, DeadlineStatus } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { DeadlineForm } from '@/components/deadline/DeadlineForm';
import { useNotifications } from '@/app/providers';
import DeadlinePrediction from '@/components/deadline/DeadlinePrediction';

/**
 * Page de détail d'une échéance
 * @param {Object} props - Propriétés de la page
 * @param {Object} props.params - Paramètres de route
 * @param {string} props.params.id - ID de l'échéance
 * @returns Page détail d'une échéance
 */
export default function DeadlineDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { showNotification } = useNotifications();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Requête pour obtenir les détails de l'échéance
  const { data: deadline, isLoading, refetch } = useDeadline(id);
  
  // Mutations pour les opérations sur l'échéance
  const { deleteDeadline, isDeleting } = useDeadlineMutations();
  
  // Fonction pour supprimer l'échéance
  const handleDelete = async () => {
    try {
      await deleteDeadline(id);
      showNotification('Échéance supprimée avec succès', 'success');
      router.push('/dashboard/deadlines');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'échéance:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };
  
  // Fonction pour obtenir la variante de badge selon la priorité
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case DeadlinePriority.CRITICAL: return 'danger';
      case DeadlinePriority.HIGH: return 'warning';
      case DeadlinePriority.MEDIUM: return 'primary';
      case DeadlinePriority.LOW: return 'secondary';
      default: return 'default';
    }
  };
  
  // Fonction pour obtenir la variante de badge selon le statut
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case DeadlineStatus.NEW: return 'primary';
      case DeadlineStatus.IN_PROGRESS: return 'warning';
      case DeadlineStatus.PENDING: return 'secondary';
      case DeadlineStatus.COMPLETED: return 'success';
      case DeadlineStatus.CANCELLED: return 'danger';
      default: return 'default';
    }
  };
  
  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Si l'échéance n'existe pas
  if (!deadline) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Échéance non trouvée</h2>
        <p className="mt-2 text-gray-500">L'échéance que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/deadlines')}>
          Retour à la liste
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <PageHeader
        title={deadline.title}
        description="Détails de l'échéance"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/deadlines')}
            >
              Retour
            </Button>
            <Button
              variant="primary"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Modifier
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Supprimer
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Titre</h3>
                <p className="mt-1 text-lg">{deadline.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{deadline.description || 'Aucune description'}</p>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date d'échéance</h3>
                  <p className="mt-1">{formatDateTime(deadline.deadlineDate)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priorité</h3>
                  <Badge className="mt-1" variant={getPriorityBadgeVariant(deadline.priority)}>
                    {deadline.priority}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                  <Badge className="mt-1" variant={getStatusBadgeVariant(deadline.status)}>
                    {deadline.status}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Visibilité</h3>
                  <Badge className="mt-1" variant="outline">
                    {deadline.visibility}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Détails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Créée le</h3>
                <p className="mt-1">{formatDateTime(deadline.createdAt)}</p>
              </div>
              
              {deadline.creator && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Créée par</h3>
                  <p className="mt-1">{deadline.creator.firstName} {deadline.creator.lastName}</p>
                </div>
              )}
              
              {deadline.project && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Projet associé</h3>
                  <p className="mt-1">{deadline.project.name}</p>
                </div>
              )}
              
              {/* Ici, on pourrait ajouter d'autres informations comme les commentaires, 
                  les pièces jointes, l'historique des modifications, etc. */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse prédictive IA - NOUVELLE SECTION */}
      <div className="mt-6">
        <DeadlinePrediction deadlineId={id} />
      </div>
      
      {/* Modal pour éditer l'échéance */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'échéance"
        size="lg"
      >
        <DeadlineForm
          deadline={deadline}
          mode="edit"
          onSuccess={() => {
            setIsEditModalOpen(false);
            refetch();
            showNotification('Échéance mise à jour avec succès', 'success');
          }}
        />
      </Modal>
      
      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Annuler
            </Button>
            
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <p>
          Êtes-vous sûr de vouloir supprimer l'échéance "{deadline.title}" ?
          Cette action est irréversible.
        </p>
      </Modal>
    </>
  );
}