'use client';

import React from 'react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { CalendarIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Deadline, DeadlineStatus, DeadlineStats } from '@/types';

/**
 * Composant affichant les métriques principales des échéances sur le tableau de bord
 * @returns {JSX.Element} Composant de métriques d'échéances
 */
export const DeadlineMetrics: React.FC = () => {
  const { data: deadlines, isLoading } = useDeadlines({});

  // Calcul des métriques à partir des données d'échéances
  const metrics = React.useMemo<DeadlineStats>(() => {
    if (!deadlines) return {
      total: 0,
      upcoming: 0,
      overdue: 0,
      completed: 0
    };

    const now = new Date();
    
    return {
      total: deadlines.length,
      upcoming: deadlines.filter((deadline: Deadline) => {
        const deadlineDate = new Date(deadline.deadlineDate);
        return deadlineDate > now && 
               deadline.status !== DeadlineStatus.COMPLETED && 
               deadline.status !== DeadlineStatus.CANCELLED;
      }).length,
      overdue: deadlines.filter((deadline: Deadline) => {
        const deadlineDate = new Date(deadline.deadlineDate);
        return deadlineDate < now && 
               deadline.status !== DeadlineStatus.COMPLETED && 
               deadline.status !== DeadlineStatus.CANCELLED;
      }).length,
      completed: deadlines.filter((deadline: Deadline) => 
        deadline.status === DeadlineStatus.COMPLETED
      ).length
    };
  }, [deadlines]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const metricItems = [
    {
      title: 'Total échéances',
      value: metrics.total,
      icon: CalendarIcon,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'À venir',
      value: metrics.upcoming,
      icon: ClockIcon,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'En retard',
      value: metrics.overdue,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'Terminées',
      value: metrics.completed,
      icon: CheckCircleIcon,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricItems.map((item, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-2xl font-semibold mt-1">{item.value}</p>
            </div>
            <div className={`p-3 rounded-full ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};