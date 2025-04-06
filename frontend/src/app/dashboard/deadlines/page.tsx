'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDeadlines } from '@/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeadlineFilters, DeadlineStatus, DeadlinePriority } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotifications } from '@/app/providers';

/**
 * Page listant toutes les échéances avec filtres
 * @returns {JSX.Element} Page de gestion des échéances
 */
export default function DeadlinesPage() {
  const [filters, setFilters] = useState<DeadlineFilters>({});
  const { data: deadlines, isLoading, error, deleteDeadline } = useDeadlines(filters);
  const { showNotification } = useNotifications();
  
  const handleFilter = (newFilters: Partial<DeadlineFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette échéance ?')) {
      try {
        await deleteDeadline(id);
        showNotification('Échéance supprimée avec succès', 'success');
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };
  
  // Fonction pour obtenir la classe CSS selon la priorité
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case DeadlinePriority.CRITICAL:
      case 'critique':
        return 'bg-red-100 text-red-800';
      case DeadlinePriority.HIGH:
      case 'haute':
        return 'bg-orange-100 text-orange-800';
      case DeadlinePriority.MEDIUM:
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800';
      case DeadlinePriority.LOW:
      case 'basse':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Fonction pour obtenir la classe CSS selon le statut
  const getStatusClass = (status: string) => {
    switch (status) {
      case DeadlineStatus.NEW:
      case 'nouvelle':
        return 'bg-blue-100 text-blue-800';
      case DeadlineStatus.IN_PROGRESS:
      case 'en cours':
        return 'bg-purple-100 text-purple-800';
      case DeadlineStatus.PENDING:
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case DeadlineStatus.COMPLETED:
      case 'complétée':
        return 'bg-green-100 text-green-800';
      case DeadlineStatus.CANCELLED:
      case 'annulée':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Échéances" 
          description="Gérez toutes vos échéances" 
        />
        <Link 
          href="/deadlines/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nouvelle échéance
        </Link>
      </div>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-3">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select 
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleFilter({ status: e.target.value || undefined })}
            >
              <option value="">Tous les statuts</option>
              <option value={DeadlineStatus.NEW}>Nouvelle</option>
              <option value={DeadlineStatus.IN_PROGRESS}>En cours</option>
              <option value={DeadlineStatus.PENDING}>En attente</option>
              <option value={DeadlineStatus.COMPLETED}>Complétée</option>
              <option value={DeadlineStatus.CANCELLED}>Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select 
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleFilter({ priority: e.target.value || undefined })}
            >
              <option value="">Toutes les priorités</option>
              <option value={DeadlinePriority.CRITICAL}>Critique</option>
              <option value={DeadlinePriority.HIGH}>Haute</option>
              <option value={DeadlinePriority.MEDIUM}>Moyenne</option>
              <option value={DeadlinePriority.LOW}>Basse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => handleFilter({ search: e.target.value || undefined })}
            />
          </div>
        </div>
      </div>
      
      {/* Liste des échéances */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-100 rounded-lg">
            Une erreur est survenue lors du chargement des échéances
          </div>
        ) : !deadlines || deadlines.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 mb-4">Aucune échéance trouvée</p>
            <Link 
              href="/deadlines/create" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Créer une échéance
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'échéance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deadlines.map((deadline) => (
                <tr key={deadline.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{deadline.title}</div>
                    {deadline.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {deadline.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(deadline.deadlineDate), 'PP', { locale: fr })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(deadline.status)}`}>
                      {deadline.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      href={`/deadlines/${deadline.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Voir
                    </Link>
                    <Link 
                      href={`/deadlines/edit/${deadline.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Modifier
                    </Link>
                    <button 
                      onClick={() => handleDelete(deadline.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
