/**
 * Composant DeadlinesTable
 * Tableau interactif affichant toutes les échéances avec tri et pagination
 * @module components/deadline/DeadlinesTable
 */
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Select
} from '@/components/ui';
import {
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  UserCircle,
  Folder
} from 'lucide-react';
import { useDeadlinesList, useDeadlineMutations } from '@/hooks/useDeadlines';
import { useNotifications } from '@/app/providers';
import { formatDate } from '@/lib/utils';
import { 
  DeadlinePriority, 
  DeadlineStatus,
  Deadline
} from '@/types';
import ConfirmDialog from '../ui/ConfirmDialog';
import Pagination from '../ui/Pagination';
import { useDeadlineContext } from '@/contexts/DeadlineContext';

/**
 * Type pour la configuration de tri
 */
type SortConfig = {
  key: keyof Deadline | string;
  direction: 'asc' | 'desc';
};

/**
 * Composant DeadlinesTable - Affiche les échéances dans un tableau interactif
 * @returns Composant de tableau des échéances
 */
export default function DeadlinesTable() {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const { filters } = useDeadlineContext();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'deadlineDate', direction: 'asc' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Utiliser le hook pour récupérer les échéances
  const { data: allDeadlines = [], isLoading, refetch } = useDeadlinesList();

  // Mutation pour la suppression
  const { deleteDeadline, isDeleting } = useDeadlineMutations();

  // Colonnes du tableau
  const columns = [
    { key: 'title', label: 'Titre', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
    { key: 'priority', label: 'Priorité', sortable: true },
    { key: 'deadlineDate', label: 'Date d\'échéance', sortable: true },
    { key: 'visibility', label: 'Visibilité', sortable: true },
    { key: 'project', label: 'Projet', sortable: true },
    { key: 'creator', label: 'Créateur', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  /**
   * Gère le clic sur l'en-tête de colonne pour trier
   * @param key - Clé de tri
   */
  const handleSort = (key: string) => {
    // Si c'est la même colonne, on inverse l'ordre
    if (sortConfig.key === key) {
      setSortConfig({
        key: key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Sinon, on trie par défaut en ordre ascendant
      setSortConfig({
        key: key,
        direction: 'asc'
      });
    }
  };

  /**
   * Obtient l'icône de tri pour la colonne
   * @param key - Clé de la colonne
   * @returns Icône de tri appropriée
   */
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
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

  /**
   * Trie et filtre les données, puis applique la pagination
   */
  const sortedAndPaginatedData = useMemo(() => {
    // Copie les données pour ne pas modifier l'original
    let result = [...allDeadlines];
    
    // Appliquer les filtres
    if (filters) {
      result = result.filter(deadline => {
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
    }
    
    // Tri
    if (sortConfig.key && sortConfig.key !== '') {
      result.sort((a, b) => {
        // Cas spéciaux pour les objets imbriqués
        if (sortConfig.key === 'project') {
          const aValue = a.project?.name || '';
          const bValue = b.project?.name || '';
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (sortConfig.key === 'creator') {
          const aValue = a.creator ? `${a.creator.firstName} ${a.creator.lastName}` : '';
          const bValue = b.creator ? `${b.creator.firstName} ${b.creator.lastName}` : '';
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          // Cas normal pour les propriétés directes
          const aValue = sortConfig.key in a ? a[sortConfig.key as keyof Deadline] : null;
          const bValue = sortConfig.key in b ? b[sortConfig.key as keyof Deadline] : null;
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (aValue instanceof Date && bValue instanceof Date) {
            return sortConfig.direction === 'asc'
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          } else {
            // Pour les dates en string
            if (sortConfig.key === 'deadlineDate') {
              const aDate = new Date(aValue as string);
              const bDate = new Date(bValue as string);
              return sortConfig.direction === 'asc'
                ? aDate.getTime() - bDate.getTime()
                : bDate.getTime() - aDate.getTime();
            }
            
            // Fallback pour les autres types
            return sortConfig.direction === 'asc'
              ? String(aValue || '').localeCompare(String(bValue || ''))
              : String(bValue || '').localeCompare(String(aValue || ''));
          }
        }
      });
    }
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: result.slice(startIndex, endIndex),
      totalCount: result.length
    };
  }, [allDeadlines, sortConfig, page, pageSize, filters]);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(sortedAndPaginatedData.totalCount / pageSize);

  return (
    <Card>
      <CardContent className="p-0">
        {/* Contrôles de pagination et taille de page */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Afficher</span>
            <Select
              className="w-20"
              value={pageSize.toString()}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1); // Réinitialiser à la première page lors du changement de taille
              }}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
            />
            <span className="text-sm text-slate-500">par page</span>
          </div>
          
          <div className="text-sm text-slate-500">
            {sortedAndPaginatedData.totalCount} échéances au total
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* En-têtes de colonnes */}
            <thead>
              <tr className="bg-slate-50">
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200"
                  >
                    {column.sortable ? (
                      <button 
                        className="flex items-center space-x-1 hover:text-slate-700"
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        <span>{getSortIcon(column.key)}</span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            
            {/* Corps du tableau */}
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-4 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedAndPaginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-4 text-center text-slate-500">
                    Aucune échéance trouvée
                  </td>
                </tr>
              ) : (
                sortedAndPaginatedData.data.map((deadline) => (
                  <tr key={deadline.id} className="hover:bg-slate-50">
                    {/* Titre */}
                    <td className="px-4 py-3 text-sm text-slate-900 max-w-xs truncate">
                      {deadline.title}
                    </td>
                    
                    {/* Statut */}
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getStatusBadgeVariant(deadline.status)}>
                        {deadline.status}
                      </Badge>
                    </td>
                    
                    {/* Priorité */}
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                    </td>
                    
                    {/* Date d'échéance */}
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className={
                          new Date(deadline.deadlineDate) < new Date() &&
                          deadline.status !== DeadlineStatus.COMPLETED &&
                          deadline.status !== DeadlineStatus.CANCELLED
                            ? "text-red-500 font-medium"
                            : ""
                        }>
                          {formatDate(deadline.deadlineDate)}
                        </span>
                      </div>
                    </td>
                    
                    {/* Visibilité */}
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <Badge variant="outline">
                        {deadline.visibility}
                      </Badge>
                    </td>
                    
                    {/* Projet */}
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>{deadline.project?.name || '-'}</span>
                      </div>
                    </td>
                    
                    {/* Créateur */}
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <div className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>
                          {deadline.creator 
                            ? `${deadline.creator.firstName} ${deadline.creator.lastName}`
                            : '-'
                          }
                        </span>
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/deadlines/${deadline.id}`)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/deadlines/${deadline.id}?edit=true`)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteId(deadline.id);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </CardContent>
      
      {/* Modal de confirmation de suppression */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer l'échéance"
        description="Êtes-vous sûr de vouloir supprimer cette échéance ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </Card>
  );
}