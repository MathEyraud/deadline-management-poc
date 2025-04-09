/**
 * Composant DeadlineMetrics
 * Affiche des métriques clés sur les échéances
 * @module components/dashboard/DeadlineMetrics
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { DeadlineStatus, DeadlinePriority } from '@/types';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

/**
 * Props pour le composant DeadlineMetrics
 */
interface DeadlineMetricsProps {
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant DeadlineMetrics - Cartes de métriques pour le tableau de bord
 * @param props - Propriétés du composant
 * @returns Composant DeadlineMetrics
 */
export const DeadlineMetrics = ({ className = '' }: DeadlineMetricsProps) => {
  const { data: deadlines = [], isLoading } = useDeadlinesList();

  // Calcul des métriques
  const totalDeadlines = deadlines.length;
  
  const completedDeadlines = deadlines.filter(
    d => d.status === DeadlineStatus.COMPLETED
  ).length;
  
  const upcomingDeadlines = deadlines.filter(
    d => new Date(d.deadlineDate) > new Date() && 
    d.status !== DeadlineStatus.COMPLETED && 
    d.status !== DeadlineStatus.CANCELLED
  ).length;
  
  const overdueDeadlines = deadlines.filter(
    d => new Date(d.deadlineDate) < new Date() && 
    d.status !== DeadlineStatus.COMPLETED &&
    d.status !== DeadlineStatus.CANCELLED
  ).length;

  const criticalDeadlines = deadlines.filter(
    d => d.priority === DeadlinePriority.CRITICAL &&
    d.status !== DeadlineStatus.COMPLETED &&
    d.status !== DeadlineStatus.CANCELLED
  ).length;

  // Calcul du taux de complétion
  const completionRate = totalDeadlines > 0 
    ? Math.round((completedDeadlines / totalDeadlines) * 100) 
    : 0;

  // Cartes de métriques
  const metricCards = [
    {
      title: "Échéances totales",
      value: totalDeadlines,
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      description: "Nombre total d'échéances",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Échéances à venir",
      value: upcomingDeadlines,
      icon: <Calendar className="h-5 w-5 text-indigo-600" />,
      description: "Échéances non passées",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Taux de complétion",
      value: `${completionRate}%`,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      description: `${completedDeadlines} sur ${totalDeadlines} complétées`,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Échéances en retard",
      value: overdueDeadlines,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      description: `Dont ${criticalDeadlines} critiques`,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metricCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                <p className="text-xs text-slate-500 mt-1">{card.description}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color.split(' ')[0]}`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeadlineMetrics;