/**
 * Composant DeadlineOverview
 * Vue d'ensemble des échéances pour le tableau de bord
 * @module components/dashboard/DeadlineOverview
 */
'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { formatDate, truncateText } from '@/lib/utils';
import { DeadlinePriority, DeadlineStatus } from '@/types';

/**
 * Props pour le composant DeadlineOverview
 */
interface DeadlineOverviewProps {
  /** Limite du nombre d'échéances à afficher */
  limit?: number;
}

/**
 * Obtient la couleur de badge en fonction de la priorité
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
 * Composant DeadlineOverview - Vue d'ensemble des échéances à venir
 * @param props - Propriétés du composant
 * @returns Composant DeadlineOverview
 */
export const DeadlineOverview = ({ limit = 5 }: DeadlineOverviewProps) => {
  // Récupérer les échéances non terminées, triées par date
  const { data: allDeadlines = [], isLoading } = useDeadlinesList({
    status: [DeadlineStatus.NEW, DeadlineStatus.IN_PROGRESS, DeadlineStatus.PENDING].join(','),
  });

  // Trier par date croissante et limiter
  const deadlines = [...allDeadlines]
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())
    .slice(0, limit);

  // Déterminer si une échéance est urgente (moins de 24h)
  const isUrgent = (date: string | Date) => {
    const deadlineTime = new Date(date).getTime();
    const nowTime = new Date().getTime();
    const oneDayMillis = 24 * 60 * 60 * 1000;
    
    return deadlineTime - nowTime < oneDayMillis;
  };

  // Calculer le nombre d'échéances en retard
  const overdueCount = allDeadlines.filter(
    deadline => new Date(deadline.deadlineDate) < new Date()
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Échéances à venir</CardTitle>
          {overdueCount > 0 && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{overdueCount} en retard</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <p>Aucune échéance à venir</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline) => (
              <Link
                key={deadline.id}
                href={`/deadlines/${deadline.id}`}
                className="block"
              >
                <div className="p-3 border border-slate-200 rounded hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">{deadline.title}</h3>
                    <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                      {deadline.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center mt-2 text-sm text-slate-500">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span className={isUrgent(deadline.deadlineDate) ? "text-red-500 font-medium" : ""}>
                      {formatDate(deadline.deadlineDate)}
                    </span>
                  </div>
                  
                  {deadline.description && (
                    <p className="mt-2 text-sm text-slate-700">
                      {truncateText(deadline.description, 100)}
                    </p>
                  )}
                  
                  {deadline.project && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {deadline.project.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </Link>
            ))}
            
            <div className="pt-2">
              <Link href="/deadlines">
                <Button variant="link" className="w-full">
                  Voir toutes les échéances
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlineOverview;