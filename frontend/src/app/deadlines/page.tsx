/**
 * Page des échéances
 * Affiche la liste des échéances avec filtres et actions
 * @module app/deadlines/page
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import DeadlineForm from '@/components/deadline/DeadlineForm';
import { useDeadlinesList, useDeadlineMutations } from '@/hooks/useDeadlines';
import { 
  Deadline, 
  DeadlinePriority, 
  DeadlineStatus, 
  DeadlineVisibility 
} from '@/types';
import { formatDate, truncateText } from '@/lib/utils';

/**
 * Page Deadlines
 * Liste et gestion des échéances
 * @returns Page Deadlines
 */
export default function DeadlinesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Requête pour récupérer les échéances
  const { data: deadlines = [], isLoading, refetch } = useDeadlinesList();
  
  // Mutations pour supprimer les échéances
  const { deleteDeadline, isDeleting } = useDeadlineMutations();
  
  // Options pour les filtres
  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: DeadlineStatus.NEW, label: 'Nouvelle' },
    { value: DeadlineStatus.IN_PROGRESS, label: 'En cours' },
    { value: DeadlineStatus.PENDING, label: 'En attente' },
    { value: DeadlineStatus.COMPLETED, label: 'Complétée' },
    { value: DeadlineStatus.CANCELLED, label: 'Annulée' },
  ];
  
  const priorityOptions = [
    { value: '', label: 'Toutes les priorités' },
    { value: DeadlinePriority.CRITICAL, label: 'Critique' },
    { value: DeadlinePriority.HIGH, label: 'Haute' },
    { value: DeadlinePriority.MEDIUM, label: 'Moyenne' },
    { value: DeadlinePriority.LOW, label: 'Basse' },
  ];
  
  // Filtrage des échéances
  const filteredDeadlines = deadlines
    .filter(deadline => {
      const matchesSearch = searchTerm === '' || 
        deadline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deadline.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === '' || deadline.status === statusFilter;
      const matchesPriority = priorityFilter === '' || deadline.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());
  
  // Gestion de la suppression
  const handleDelete = async () => {
    if (!selectedDeadline) return;
    
    try {
      await deleteDeadline(selectedDeadline.id);
      setIsDeleteModalOpen(false);
      setSelectedDeadline(null);
      refetch();
    } catch (error) {
      console.error('Error deleting deadline:', error);
    }
  };
  
  // Obtient la variante de badge pour la priorité
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case DeadlinePriority.CRITICAL: return 'danger';
      case DeadlinePriority.HIGH: return 'warning';
      case DeadlinePriority.MEDIUM: return 'primary';
      case DeadlinePriority.LOW: return 'secondary';
      default: return 'default';
    }
  };
  
  // Obtient la variante de badge pour le statut
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
  
  return (
    <DashboardLayout>
      <PageHeader
        title="Échéances"
        description="Gérez vos échéances et suivez leur avancement"
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
      
      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une échéance..."
                leftAddon={<Search className="h-4 w-4 text-slate-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button
              variant="secondary"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtres
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Statut"
              />
              
              <Select
                options={priorityOptions}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priorité"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Liste des échéances */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDeadlines.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>Aucune échéance trouvée.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredDeadlines.map((deadline) => (
                <div key={deadline.id} className="p-4 hover:bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{deadline.title}</h3>
                      
                      <div className="flex flex-wrap items-center mt-2 space-x-2">
                        <Badge variant={getStatusBadgeVariant(deadline.status)}>
                          {deadline.status}
                        </Badge>
                        
                        <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                        
                        <span className="text-sm text-slate-500">
                          {formatDate(deadline.deadlineDate)}
                        </span>
                      </div>
                      
                      {deadline.description && (
                        <p className="mt-2 text-sm text-slate-700">
                          {truncateText(deadline.description, 150)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 mt-3 md:mt-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/deadlines/${deadline.id}`)}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDeadline(deadline);
                          router.push(`/deadlines/edit/${deadline.id}`);
                        }}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDeadline(deadline);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
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
          Êtes-vous sûr de vouloir supprimer l'échéance "{selectedDeadline?.title}" ?
          Cette action est irréversible.
        </p>
      </Modal>
    </DashboardLayout>
  );
}