/**
 * Store Recoil pour la gestion des échéances
 * Gère l'état global des filtres d'échéances entre les différentes vues
 * @module store/deadlines
 */
import { atom } from 'recoil';

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
 * État Recoil pour les filtres d'échéances
 * Permet de partager les filtres entre les différentes vues
 */
export const deadlineFiltersState = atom<DeadlineFilters>({
  key: 'deadlineFiltersState',
  default: {
    search: '',
    status: '',
    priority: '',
    projectId: '',
    startDate: null,
    endDate: null,
  },
});

/**
 * État Recoil pour le mode d'affichage des échéances
 * 'list' | 'table' | 'calendar'
 */
export const deadlineViewModeState = atom<string>({
  key: 'deadlineViewModeState',
  default: 'list',
});