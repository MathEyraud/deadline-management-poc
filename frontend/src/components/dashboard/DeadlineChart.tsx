'use client';

import React, { useMemo } from 'react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Deadline, DeadlinePriority, DeadlineStatus } from '@/types';

interface DeadlineChartProps {
  type: 'priority' | 'status';
}

/**
 * Composant de visualisation graphique des échéances par priorité ou statut
 * @param {Object} props - Propriétés du composant
 * @param {'priority' | 'status'} props.type - Type de graphique à afficher
 * @returns {JSX.Element} Graphique des échéances
 */
export const DeadlineChart: React.FC<DeadlineChartProps> = ({ type }) => {
  const { data: deadlines, isLoading } = useDeadlines({});
  
  // Couleurs pour les différentes priorités ou statuts
  const COLORS = {
    priority: {
      [DeadlinePriority.CRITICAL]: '#dc2626', // rouge vif
      [DeadlinePriority.HIGH]: '#ef4444',     // rouge
      [DeadlinePriority.MEDIUM]: '#f59e0b',   // orange/jaune
      [DeadlinePriority.LOW]: '#10b981',      // vert
    },
    status: {
      [DeadlineStatus.NEW]: '#3b82f6',        // bleu
      [DeadlineStatus.IN_PROGRESS]: '#8b5cf6', // violet
      [DeadlineStatus.PENDING]: '#f59e0b',     // orange
      [DeadlineStatus.COMPLETED]: '#10b981',   // vert
      [DeadlineStatus.CANCELLED]: '#6b7280',   // gris
    }
  };
  
  // Préparation des données pour le graphique
  const chartData = useMemo(() => {
    if (!deadlines || deadlines.length === 0) return [];
    
    if (type === 'priority') {
      const priorityCounts: Record<string, number> = {};
      
      // Initialiser toutes les priorités à 0
      Object.values(DeadlinePriority).forEach(priority => {
        priorityCounts[priority] = 0;
      });
      
      // Comptage des échéances par priorité
      deadlines.forEach((deadline: Deadline) => {
        const priority = deadline.priority;
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      });
      
      return Object.entries(priorityCounts)
        .filter(([_, count]) => count > 0) // Filtrer les priorités sans échéances
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitaliser
          value
        }));
    } else { // status
      const statusCounts: Record<string, number> = {};
      
      // Initialiser tous les statuts à 0
      Object.values(DeadlineStatus).forEach(status => {
        statusCounts[status] = 0;
      });
      
      // Comptage des échéances par statut
      deadlines.forEach((deadline: Deadline) => {
        const status = deadline.status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      return Object.entries(statusCounts)
        .filter(([_, count]) => count > 0) // Filtrer les statuts sans échéances
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitaliser
          value
        }));
    }
  }, [deadlines, type]);
  
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow h-80 flex items-center justify-center">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }
  
  // Affiche un graphique en camembert pour les priorités, en barres pour les statuts
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium text-lg mb-4">
        {type === 'priority' ? 'Répartition par priorité' : 'Répartition par statut'}
      </h3>
      
      <div className="h-64">
        {type === 'priority' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS.priority[entry.name.toLowerCase() as keyof typeof COLORS.priority] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} échéance(s)`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} échéance(s)`, '']} />
              <Legend />
              <Bar dataKey="value" name="Nombre d'échéances">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS.status[entry.name.toLowerCase() as keyof typeof COLORS.status] || '#8884d8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};