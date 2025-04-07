/**
 * Composant DeadlineChart
 * Diagramme pour visualiser les statistiques des échéances
 * @module components/dashboard/DeadlineChart
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { DeadlinePriority, DeadlineStatus } from '@/types';

/**
 * Props pour le composant DeadlineChart
 */
interface DeadlineChartProps {
  /** Type de graphique à afficher (statut ou priorité) */
  type?: 'status' | 'priority';
  /** Format du graphique (bar ou pie) */
  chartType?: 'bar' | 'pie';
  /** Titre du graphique */
  title?: string;
}

/**
 * Couleurs pour les différents statuts
 */
const STATUS_COLORS = {
  [DeadlineStatus.NEW]: '#3b82f6',
  [DeadlineStatus.IN_PROGRESS]: '#f59e0b',
  [DeadlineStatus.PENDING]: '#6366f1',
  [DeadlineStatus.COMPLETED]: '#10b981',
  [DeadlineStatus.CANCELLED]: '#ef4444',
};

/**
 * Couleurs pour les différentes priorités
 */
const PRIORITY_COLORS = {
  [DeadlinePriority.CRITICAL]: '#ef4444',
  [DeadlinePriority.HIGH]: '#f59e0b',
  [DeadlinePriority.MEDIUM]: '#3b82f6',
  [DeadlinePriority.LOW]: '#6b7280',
};

/**
 * Composant DeadlineChart - Graphique des statistiques d'échéances
 * @param props - Propriétés du composant
 * @returns Composant DeadlineChart
 */
export const DeadlineChart = ({
  type = 'status',
  chartType = 'bar',
  title = 'Statistiques des échéances',
}: DeadlineChartProps) => {
  // Récupérer toutes les échéances
  const { data: deadlines = [], isLoading } = useDeadlinesList();
  
  // Fonction pour préparer les données selon le type
  const prepareChartData = () => {
    if (type === 'status') {
      // Compter les échéances par statut
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
      
      return Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: STATUS_COLORS[status as DeadlineStatus],
      }));
    } else {
      // Compter les échéances par priorité
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
      
      return Object.entries(priorityCounts).map(([priority, count]) => ({
        name: priority,
        value: count,
        color: PRIORITY_COLORS[priority as DeadlinePriority],
      }));
    }
  };
  
  const chartData = prepareChartData();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} échéances`, '']}
                    labelFormatter={(name) => `${name}`}
                  />
                  <Bar dataKey="value" name="Nombre d'échéances">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} échéances`, '']}
                    labelFormatter={(name) => `${name}`}
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlineChart;