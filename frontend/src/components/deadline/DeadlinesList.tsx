/**
 * Composant DeadlinesList
 * Vue liste des échéances avec cartes
 * @module components/deadline/DeadlinesList
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Edit,
  Trash2,
  Eye,
  CalendarClock
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  Button, 
  Badge, 
  Modal
} from '@/components/ui';
import { useDeadlinesList, useDeadlineMutations } from '@/hooks/useDeadlines';
import { useNotifications } from '@/app/providers';
import { formatDate } from '@/lib/utils';
import { DeadlinePriority, DeadlineStatus } from '@/types';
import { useDeadlineContext } from '@/contexts/DeadlineContext';
import VisibilityIndicator from './VisibilityIndicator';

/**
 * Composant DeadlinesList - Affiche les échéances sous forme de liste de cartes
 * @returns Composant de liste d'échéances
 */
export default function DeadlinesList() {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const { filters } = useDeadlineContext();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Utiliser le hook pour récupérer les échéances avec filtrage
  const { data: deadlines = [], isLoading, refetch } = useDeadlinesList();
  
  // Mutation pour la suppression
  const { deleteDeadline, isDeleting } = useDeadlineMutations();

  /**
   * Filtre les échéances en fonction des filtres actifs
   */
  const filteredDeadlines = React.useMemo(() => {
    return deadlines.filter(deadline => {
      // Filtre de recherche
      if (filters.search && !deadline.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(deadline.description || '').toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filtre par statut
      if (filters.status && deadline.status !== filters.status) {
        return false;
      }
      
      // Filtre par priorité
      if (filters.priority && deadline.priority !== filters.priority) {
        return false;
      }
      
      // Filtre par projet
      if (filters.projectId && deadline.projectId !== filters.projectId) {
        return false;
      }
      
      // Filtre par date de début
      if (filters.startDate && new Date(deadline.deadlineDate) < filters.startDate) {
        return false;
      }
      
      // Filtre par date de fin
      if (filters.endDate && new Date(deadline.deadlineDate) > filters.endDate) {
        return false;
      }
      
      return true;
    });
  }, [deadlines, filters]);
  
  /**
   * Obtient la variante de badge en fonction de la priorité
   * @param priority - Priorité de l'échéance
   * @returns Variante de badge correspondante
   */
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case DeadlinePriority.CRITICAL:
        return 'danger';
      case DeadlinePriority.HIGH:
        return 'warning';
      case DeadlinePriority.MEDIUM:
        return 'primary';
      case DeadlinePriority.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  /**
   * Obtient la variante de badge en fonction du statut
   * @param status - Statut de l'échéance
   * @returns Variante de badge correspondante
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case DeadlineStatus.NEW:
        return 'primary';
      case DeadlineStatus.IN_PROGRESS:
        return 'warning';
      case DeadlineStatus.PENDING:
        return 'secondary';
      case DeadlineStatus.COMPLETED:
        return 'success';
      case DeadlineStatus.CANCELLED:
        return 'danger';
      default:
        return 'default';
    }
  };
  
  /**
   * Vérifie si une échéance est en retard
   * @param date - Date d'échéance
   * @param status - Statut de l'échéance
   * @returns true si l'échéance est en retard
   */
  const isOverdue = (date: string | Date, status: string) => {
    return new Date(date) < new Date() && 
      status !== DeadlineStatus.COMPLETED && 
      status !== DeadlineStatus.CANCELLED;
  };
  
  /**
   * Vérifie si une échéance est imminente (< 48h)
   * @param date - Date d'échéance
   * @returns true si l'échéance est imminente
   */
  const isImminent = (date: string | Date) => {
    const deadlineTime = new Date(date).getTime();
    const nowTime = new Date().getTime();
    const twoDaysMillis = 48 * 60 * 60 * 1000;
    
    return (deadlineTime - nowTime < twoDaysMillis) && 
           (deadlineTime > nowTime);
  };
  
  /**
   * Gère la suppression d'une échéance
   */
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteDeadline(deleteId);
      showNotification('Échéance supprimée avec succès', 'success');
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDeadlines.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-500 mb-4">Aucune échéance trouvée</p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/deadlines/create')}
            >
              Créer une échéance
            </Button>
          </CardContent>
        </Card>
      ) : (
        filteredDeadlines.map((deadline) => (
          <Card key={deadline.id} className={
            isOverdue(deadline.deadlineDate, deadline.status) 
              ? 'border-red-300 bg-red-50' 
              : isImminent(deadline.deadlineDate) && deadline.status !== DeadlineStatus.COMPLETED 
                ? 'border-amber-300 bg-amber-50' 
                : ''
          }>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Informations principales */}
                <div className="flex-grow">

                  <h3 className="font-medium text-lg">{deadline.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                      {deadline.priority}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(deadline.status)}>
                      {deadline.status}
                    </Badge>
                    <VisibilityIndicator
                      visibility={deadline.visibility} 
                      showLabel={true}
                    />
                  </div>
                  
                  {deadline.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {deadline.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className={isOverdue(deadline.deadlineDate, deadline.status) ? "text-red-500 font-medium" : ""}>
                        {formatDate(deadline.deadlineDate)}
                      </span>
                    </div>
                    
                    {deadline.project && (
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        <span>{deadline.project.name}</span>
                      </div>
                    )}
                    
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {deadline.visibility}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => router.push(`/dashboard/deadlines/${deadline.id}`)}
                  >
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="h-4 w-4" />}
                    onClick={() => router.push(`/dashboard/deadlines/${deadline.id}?edit=true`)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => {
                      setDeleteId(deadline.id);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      
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
          Êtes-vous sûr de vouloir supprimer cette échéance ?
          Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}