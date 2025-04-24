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
  Search, 
  Filter, 
  Clock, 
  CalendarClock, 
  Edit,
  Trash2,
  Eye,
  TableIcon
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  Card, 
  CardContent, 
  Input, 
  Button, 
  Select, 
  Badge,
  Modal
} from '@/components/ui';
import { useDeadlinesList, useDeadlineMutations } from '@/hooks/useDeadlines';
import { useProjectsList } from '@/hooks/useProjects';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useNotifications } from '@/app/providers';
import { DeadlinePriority, DeadlineStatus, DeadlineVisibility } from '@/types';
import Link from 'next/link';

/**
 * Page de liste des échéances
 * @returns Page affichant toutes les échéances avec filtres
 */
export default function DeadlinesPage() {
  const router = useRouter();
  const { showNotification } = useNotifications();
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // État pour la suppression
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Récupération des données
  const { data: projects = [] } = useProjectsList();
  const { deleteDeadline, isDeleting } = useDeadlineMutations();
  
  // Construction des filtres pour la requête API
  const filters: any = {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    projectId: projectFilter || undefined,
    search: searchTerm || undefined,
    order: sortOrder,
    sort: 'deadlineDate',
  };
  
  // Récupération des échéances filtrées
  const { data: deadlines = [], isLoading, refetch } = useDeadlinesList(filters);
  
  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setProjectFilter('');
    setSearchTerm('');
  };
  
  /**
   * Gère la confirmation de suppression
   * @param id - ID de l'échéance à supprimer
   */
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };
  
  /**
   * Gère la suppression effective
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
  
  return (
    <>
      <PageHeader
        title="Échéances"
        description="Consultez et gérez toutes vos échéances"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<TableIcon className="h-4 w-4" />}
              onClick={() => router.push('/dashboard/deadlines/table')}
            >
              Vue tableau
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
      
      {/* Section de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une échéance..."
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                options={[
                  { value: 'asc', label: 'Plus anciennes d\'abord' },
                  { value: 'desc', label: 'Plus récentes d\'abord' },
                ]}
                className="w-48"
              />
              
              <Button
                variant="outline"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtres
              </Button>
              
              {(statusFilter || priorityFilter || projectFilter || searchTerm) && (
                <Button variant="ghost" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  label="Statut"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Tous les statuts' },
                    { value: DeadlineStatus.NEW, label: 'Nouvelle' },
                    { value: DeadlineStatus.IN_PROGRESS, label: 'En cours' },
                    { value: DeadlineStatus.PENDING, label: 'En attente' },
                    { value: DeadlineStatus.COMPLETED, label: 'Complétée' },
                    { value: DeadlineStatus.CANCELLED, label: 'Annulée' },
                  ]}
                />
              </div>
              
              <div>
                <Select
                  label="Priorité"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Toutes les priorités' },
                    { value: DeadlinePriority.CRITICAL, label: 'Critique' },
                    { value: DeadlinePriority.HIGH, label: 'Haute' },
                    { value: DeadlinePriority.MEDIUM, label: 'Moyenne' },
                    { value: DeadlinePriority.LOW, label: 'Basse' },
                  ]}
                />
              </div>
              
              <div>
                <Select
                  label="Projet"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  options={[
                    { value: '', label: 'Tous les projets' },
                    ...projects.map(project => ({
                      value: project.id,
                      label: project.name
                    }))
                  ]}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Liste des échéances */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : deadlines.length === 0 ? (
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
        <div className="space-y-4">
          {deadlines.map((deadline) => (
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
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <h3 className="font-medium text-lg">{deadline.title}</h3>
                      <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(deadline.status)}>
                        {deadline.status}
                      </Badge>
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
                      onClick={() => handleDeleteClick(deadline.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
    </>
  );
}