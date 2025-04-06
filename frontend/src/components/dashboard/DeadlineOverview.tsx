'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Button } from '@/components/ui/Button';
import { Deadline, DeadlinePriority, DeadlineStatus } from '@/types';

interface DeadlineOverviewProps {
  limit?: number;
}

/**
 * Composant affichant un aperçu des échéances imminentes
 * @param {Object} props - Propriétés du composant
 * @param {number} props.limit - Nombre maximum d'échéances à afficher
 * @returns {JSX.Element} Aperçu des échéances imminentes
 */
export const DeadlineOverview: React.FC<DeadlineOverviewProps> = ({ limit = 5 }) => {
  const { data: deadlines, isLoading } = useDeadlines({
    limit,
    sort: 'deadlineDate',
    order: 'asc',
    status: [DeadlineStatus.NEW, DeadlineStatus.IN_PROGRESS, DeadlineStatus.PENDING] // Filtrer pour n'afficher que les échéances non terminées
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-sm animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500 mb-4">Aucune échéance imminente</p>
        <Link href="/deadlines/create">
          <Button>Créer une échéance</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deadlines.map((deadline: Deadline) => (
        <Link href={`/deadlines/${deadline.id}`} key={deadline.id} className="block">
          <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {deadline.description || 'Aucune description'}
                </p>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full 
                ${deadline.priority === DeadlinePriority.HIGH || deadline.priority === 'haute' ? 'bg-red-100 text-red-800' : 
                  deadline.priority === DeadlinePriority.MEDIUM || deadline.priority === 'moyenne' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'}`}>
                {deadline.priority}
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 text-sm">
              <span className="text-gray-600">
                {format(new Date(deadline.deadlineDate), 'dd MMM yyyy', { locale: fr })}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs
                ${deadline.status === DeadlineStatus.NEW || deadline.status === 'nouvelle' ? 'bg-blue-100 text-blue-800' : 
                  deadline.status === DeadlineStatus.IN_PROGRESS || deadline.status === 'en cours' ? 'bg-purple-100 text-purple-800' :
                  deadline.status === DeadlineStatus.PENDING || deadline.status === 'en attente' ? 'bg-orange-100 text-orange-800' :
                  deadline.status === DeadlineStatus.COMPLETED || deadline.status === 'complétée' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'}`}>
                {deadline.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
      
      <div className="text-center pt-2">
        <Link href="/deadlines">
          <Button variant="outline">Voir toutes les échéances</Button>
        </Link>
      </div>
    </div>
  );
};