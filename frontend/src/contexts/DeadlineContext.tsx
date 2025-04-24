/**
 * Contexte pour la gestion des filtres d'échéances
 * Fournit un état global pour les filtres entre les différentes vues
 * @module contexts/DeadlineContext
 */
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Interface pour les filtres d'échéances
 */
export interface DeadlineFilters {
  /** Terme de recherche global */
  search: string;
  /** Filtre par statut */
  status: string;
  /** Filtre par priorité */
  priority: string;
  /** Filtre par projet */
  projectId: string;
  /** Date de début pour le filtrage */
  startDate: Date | null;
  /** Date de fin pour le filtrage */
  endDate: Date | null;
}

/**
 * Interface pour le contexte des échéances
 */
interface DeadlineContextType {
  /** État actuel des filtres */
  filters: DeadlineFilters;
  /** Fonction pour mettre à jour les filtres */
  setFilters: (filters: DeadlineFilters) => void;
  /** Mode d'affichage actuel (liste, tableau, calendrier) */
  viewMode: string;
  /** Fonction pour changer le mode d'affichage */
  setViewMode: (mode: string) => void;
}

// Valeurs par défaut des filtres
const defaultFilters: DeadlineFilters = {
  search: '',
  status: '',
  priority: '',
  projectId: '',
  startDate: null,
  endDate: null,
};

// Création du contexte
const DeadlineContext = createContext<DeadlineContextType | undefined>(undefined);

/**
 * Provider pour le contexte des échéances
 * @param props - Propriétés du composant
 * @returns Provider du contexte des échéances
 */
export function DeadlineProvider({ children }: { children: ReactNode }) {
  // État pour les filtres
  const [filters, setFilters] = useState<DeadlineFilters>(defaultFilters);
  // État pour le mode d'affichage
  const [viewMode, setViewMode] = useState<string>('list');

  return (
    <DeadlineContext.Provider
      value={{
        filters,
        setFilters,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </DeadlineContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte des échéances
 * @returns Contexte des échéances
 */
export function useDeadlineContext() {
  const context = useContext(DeadlineContext);
  if (context === undefined) {
    throw new Error('useDeadlineContext must be used within a DeadlineProvider');
  }
  return context;
}