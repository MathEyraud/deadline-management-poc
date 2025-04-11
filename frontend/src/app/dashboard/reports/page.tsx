/**
 * Page des rapports et statistiques de l'application
 * Affiche des visualisations et métriques à partir des données
 * @module app/dashboard/reports/page
 */
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { useProjectsList } from '@/hooks/useProjects';
import { useTeamsList } from '@/hooks/useTeams';
import { DeadlinePriority, DeadlineStatus } from '@/types';
import { 
  BarChart, 
  Bar,
  PieChart, 
  Pie, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Couleurs pour les graphiques
 */
const COLORS = {
  priority: {
    [DeadlinePriority.CRITICAL]: '#ef4444',
    [DeadlinePriority.HIGH]: '#f59e0b',
    [DeadlinePriority.MEDIUM]: '#3b82f6',
    [DeadlinePriority.LOW]: '#6b7280',
  },
  status: {
    [DeadlineStatus.NEW]: '#3b82f6',
    [DeadlineStatus.IN_PROGRESS]: '#f59e0b',
    [DeadlineStatus.PENDING]: '#6366f1',
    [DeadlineStatus.COMPLETED]: '#10b981',
    [DeadlineStatus.CANCELLED]: '#ef4444',
  },
};

/**
 * Période pour les statistiques
 */
type Period = 'weekly' | 'monthly' | 'yearly';

/**
 * Page des rapports
 * @returns Page de rapports et statistiques
 */
export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  
  // Récupérer toutes les données nécessaires
  const { data: deadlines = [], isLoading: isLoadingDeadlines } = useDeadlinesList();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjectsList();
  const { data: teams = [], isLoading: isLoadingTeams } = useTeamsList();
  
  const isLoading = isLoadingDeadlines || isLoadingProjects || isLoadingTeams;
  
  /**
   * Prépare les données pour le graphique de répartition des priorités
   * @returns Données formatées pour le graphique
   */
  const preparePriorityData = () => {
    const priorityCounts: Record<string, number> = {
      [DeadlinePriority.CRITICAL]: 0,
      [DeadlinePriority.HIGH]: 0,
      [DeadlinePriority.MEDIUM]: 0,
      [DeadlinePriority.LOW]: 0,
    };
    
    deadlines.forEach(deadline => {
      if (priorityCounts[deadline.priority] !== undefined) {
        priorityCounts[deadline.priority]++;
      }
    });
    
    return Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };
  
  /**
   * Prépare les données pour le graphique de répartition des statuts
   * @returns Données formatées pour le graphique
   */
  const prepareStatusData = () => {
    const statusCounts: Record<string, number> = {
      [DeadlineStatus.NEW]: 0,
      [DeadlineStatus.IN_PROGRESS]: 0,
      [DeadlineStatus.PENDING]: 0,
      [DeadlineStatus.COMPLETED]: 0,
      [DeadlineStatus.CANCELLED]: 0,
    };
    
    deadlines.forEach(deadline => {
      if (statusCounts[deadline.status] !== undefined) {
        statusCounts[deadline.status]++;
      }
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };
  
  /**
   * Prépare les données pour le graphique de progression dans le temps
   * @returns Données formatées pour le graphique
   */
  const prepareProgressData = () => {
    // Trier les échéances par date
    const sortedDeadlines = [...deadlines].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Regrouper par période
    const dataPoints: { date: string; completed: number; total: number }[] = [];
    
    if (sortedDeadlines.length === 0) return [];
    
    // Détermine l'intervalle en fonction de la période
    let interval: number;
    let dateFormat: (date: Date) => string;
    
    switch (period) {
      case 'weekly':
        interval = 7 * 24 * 60 * 60 * 1000; // 7 jours
        dateFormat = (date) => `${date.getDate()}/${date.getMonth() + 1}`;
        break;
      case 'yearly':
        interval = 30 * 24 * 60 * 60 * 1000 * 3; // Trimestre (3 mois)
        dateFormat = (date) => `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
        break;
      case 'monthly':
      default:
        interval = 7 * 24 * 60 * 60 * 1000; // Semaine
        dateFormat = (date) => `S${Math.ceil((date.getDate()) / 7)}`;
        break;
    }
    
    // Date de la première échéance
    const startDate = new Date(sortedDeadlines[0].createdAt);
    // Date actuelle
    const endDate = new Date();
    
    // Créer les points de données
    for (let date = new Date(startDate); date <= endDate; date = new Date(date.getTime() + interval)) {
      // Compter les échéances créées jusqu'à cette date
      const totalUntilDate = sortedDeadlines.filter(d => new Date(d.createdAt) <= date).length;
      // Compter les échéances terminées jusqu'à cette date
      const completedUntilDate = sortedDeadlines.filter(
        d => new Date(d.createdAt) <= date && d.status === DeadlineStatus.COMPLETED
      ).length;
      
      dataPoints.push({
        date: dateFormat(date),
        completed: completedUntilDate,
        total: totalUntilDate,
      });
    }
    
    return dataPoints;
  };
  
  /**
   * Prépare les données pour le graphique des échéances par projet
   * @returns Données formatées pour le graphique
   */
  const prepareProjectData = () => {
    // Créer un mapping des projets par ID
    const projectMap = new Map(projects.map(project => [project.id, project]));
    
    // Compter les échéances par projet
    const projectCounts: Record<string, { completed: number; total: number }> = {};
    
    deadlines.forEach(deadline => {
      if (deadline.projectId) {
        if (!projectCounts[deadline.projectId]) {
          projectCounts[deadline.projectId] = { completed: 0, total: 0 };
        }
        
        projectCounts[deadline.projectId].total++;
        
        if (deadline.status === DeadlineStatus.COMPLETED) {
          projectCounts[deadline.projectId].completed++;
        }
      }
    });
    
    // Convertir en format pour le graphique
    return Object.entries(projectCounts)
      .map(([projectId, counts]) => ({
        name: projectMap.get(projectId)?.name || 'Projet inconnu',
        completed: counts.completed,
        pending: counts.total - counts.completed,
      }))
      // Prendre les 5 projets avec le plus d'échéances
      .sort((a, b) => (b.completed + b.pending) - (a.completed + a.pending))
      .slice(0, 5);
  };
  
  const priorityData = preparePriorityData();
  const statusData = prepareStatusData();
  const progressData = prepareProgressData();
  const projectData = prepareProjectData();
  
  return (
    <>
      <PageHeader
        title="Rapports et statistiques"
        description="Analyse des performances et tendances"
      />
      
      {/* Sélecteur de période */}
      <div className="mb-6 flex justify-end">
        <div className="w-48">
          <Select
            label=""
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            options={[
              { value: 'weekly', label: 'Vue hebdomadaire' },
              { value: 'monthly', label: 'Vue mensuelle' },
              { value: 'yearly', label: 'Vue annuelle' },
            ]}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Répartition par priorité */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par priorité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS.priority[entry.name as DeadlinePriority] || '#8884d8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} échéances`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Répartition par statut */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS.status[entry.name as DeadlineStatus] || '#8884d8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} échéances`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Progression dans le temps */}
          <Card>
            <CardHeader>
              <CardTitle>Progression des échéances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3b82f6" 
                      name="Total des échéances" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      name="Échéances terminées" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Top 5 des projets */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des projets par échéances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="completed" 
                      name="Terminées" 
                      stackId="a" 
                      fill="#10b981" 
                    />
                    <Bar 
                      dataKey="pending" 
                      name="En cours" 
                      stackId="a" 
                      fill="#f59e0b" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Statistiques récapitulatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Total échéances</h3>
                <p className="mt-2 text-3xl font-bold">{deadlines.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Taux de complétion</h3>
                <p className="mt-2 text-3xl font-bold">
                  {deadlines.length > 0 
                    ? `${Math.round((deadlines.filter(d => d.status === DeadlineStatus.COMPLETED).length / deadlines.length) * 100)}%` 
                    : '0%'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Projets actifs</h3>
                <p className="mt-2 text-3xl font-bold">
                  {projects.filter(p => p.status === 'actif').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500">Équipes</h3>
                <p className="mt-2 text-3xl font-bold">{teams.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}