/**
 * Page du tableau de bord
 * Affiche les statistiques et les échéances à venir
 * @module app/dashboard/page
 */
'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import DeadlineOverview from '@/components/dashboard/DeadlineOverview';
import DeadlineChart from '@/components/dashboard/DeadlineChart';
import DeadlineMetrics from '@/components/dashboard/DeadlineMetrics';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { DeadlineStatus } from '@/types';

/**
 * Page Dashboard
 * Tableau de bord principal de l'application
 * @returns Page Dashboard
 */
export default function DashboardPage() {
  const { data: deadlines = [] } = useDeadlinesList();
  
  // Calcul du nombre d'échéances en retard
  const overdueDeadlines = deadlines.filter(
    d => new Date(d.deadlineDate) < new Date() && 
    d.status !== DeadlineStatus.COMPLETED && 
    d.status !== DeadlineStatus.CANCELLED
  ).length;
  
  return (
    <DashboardLayout>
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur votre espace de gestion d'échéances"
      />
      
      {/* Stats Metrics */}
      <DeadlineMetrics className="mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Échéances à venir */}
        <DeadlineOverview limit={5} />
        
        {/* Statistiques */}
        <div className="space-y-6">
          <DeadlineChart 
            type="status" 
            chartType="pie" 
            title="Échéances par statut" 
          />
          
          <DeadlineChart 
            type="priority" 
            chartType="bar" 
            title="Échéances par priorité" 
          />
        </div>
      </div>

      {overdueDeadlines > 0 && (
        <Card className="mt-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">
                <strong>Attention:</strong> Vous avez {overdueDeadlines} échéance{overdueDeadlines > 1 ? 's' : ''} en retard.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}