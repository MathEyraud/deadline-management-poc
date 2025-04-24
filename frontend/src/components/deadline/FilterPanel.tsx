/**
 * Composant FilterPanel
 * Panneau de filtres pour le tableau d'échéances
 * @module components/deadline/FilterPanel
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Input, Select, Button, DatePicker } from '@/components/ui';
import { Filter, X } from 'lucide-react';
import { DeadlinePriority, DeadlineStatus } from '@/types';
import { useProjectsList } from '@/hooks/useProjects';
import { useDeadlineContext } from '@/contexts/DeadlineContext';

/**
 * Props pour le composant FilterPanel
 */
interface FilterPanelProps {
  /** Si le panneau est ouvert */
  isOpen: boolean;
  /** Fonction pour basculer l'état du panneau */
  onToggle: () => void;
}

/**
 * Composant FilterPanel - Panneau de filtres pour le tableau d'échéances
 * @param props - Propriétés du composant
 * @returns Composant de filtrage
 */
export default function FilterPanel({ isOpen, onToggle }: FilterPanelProps) {
  // Utiliser le contexte au lieu de Recoil
  const { filters, setFilters } = useDeadlineContext();
  
  // État local pour suivre les changements avant de les appliquer
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Récupération des projets pour le filtre
  const { data: projects = [] } = useProjectsList();
  
  // Synchronise les filtres locaux avec l'état global
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  /**
   * Met à jour un filtre local
   * @param key - Clé du filtre à mettre à jour
   * @param value - Nouvelle valeur
   */
  const updateLocalFilter = (key: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Applique les filtres locaux à l'état global
   */
  const applyFilters = () => {
    setFilters(localFilters);
  };

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      priority: '',
      projectId: '',
      startDate: null,
      endDate: null,
    };
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  if (!isOpen) {
    return (
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          leftIcon={<Filter className="h-4 w-4" />}
          onClick={onToggle}
        >
          Filtres
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filtres avancés</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            title="Fermer les filtres"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recherche globale */}
          <Input
            label="Recherche"
            placeholder="Rechercher par titre ou description"
            value={localFilters.search}
            onChange={(e) => updateLocalFilter('search', e.target.value)}
          />
          
          {/* Statut */}
          <Select
            label="Statut"
            value={localFilters.status}
            onChange={(e) => updateLocalFilter('status', e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: DeadlineStatus.NEW, label: 'Nouvelle' },
              { value: DeadlineStatus.IN_PROGRESS, label: 'En cours' },
              { value: DeadlineStatus.PENDING, label: 'En attente' },
              { value: DeadlineStatus.COMPLETED, label: 'Complétée' },
              { value: DeadlineStatus.CANCELLED, label: 'Annulée' },
            ]}
          />
          
          {/* Priorité */}
          <Select
            label="Priorité"
            value={localFilters.priority}
            onChange={(e) => updateLocalFilter('priority', e.target.value)}
            options={[
              { value: '', label: 'Toutes les priorités' },
              { value: DeadlinePriority.CRITICAL, label: 'Critique' },
              { value: DeadlinePriority.HIGH, label: 'Haute' },
              { value: DeadlinePriority.MEDIUM, label: 'Moyenne' },
              { value: DeadlinePriority.LOW, label: 'Basse' },
            ]}
          />
          
          {/* Projet */}
          <Select
            label="Projet"
            value={localFilters.projectId}
            onChange={(e) => updateLocalFilter('projectId', e.target.value)}
            options={[
              { value: '', label: 'Tous les projets' },
              ...projects.map(project => ({
                value: project.id,
                label: project.name
              }))
            ]}
          />
          
          {/* Date de début */}
          <DatePicker
            label="Date de début"
            selected={localFilters.startDate ? new Date(localFilters.startDate) : null}
            onChange={(date) => updateLocalFilter('startDate', date)}
            placeholderText="À partir de..."
          />
          
          {/* Date de fin */}
          <DatePicker
            label="Date de fin"
            selected={localFilters.endDate ? new Date(localFilters.endDate) : null}
            onChange={(date) => updateLocalFilter('endDate', date)}
            placeholderText="Jusqu'à..."
          />
        </div>
        
        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={resetFilters}
          >
            Réinitialiser
          </Button>
          
          <Button
            variant="primary"
            onClick={applyFilters}
          >
            Appliquer les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}