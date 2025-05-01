import React from 'react';
import { CardHeader, CardTitle, Select } from '@/components/ui';
import { CalendarViewMode, CalendarDateRange } from './types/calendar.types';
import { formatDateRangeTitle } from './utils/calendarUtils';

/**
 * Options de vue du calendrier
 */
const VIEW_OPTIONS = [
  { value: 'annual', label: 'Annuel' },
  { value: 'biannual', label: 'Semestriel' },
  { value: 'fourmonth', label: 'Quadrimestriel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'biweekly', label: 'Bimensuel' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'daily', label: 'Journalier' }
];

/**
 * Props pour le composant CalendarHeader
 */
interface CalendarHeaderProps {
  /** Mode de vue actuel */
  viewMode: CalendarViewMode;
  /** Date actuelle */
  currentDate: Date;
  /** Plage de dates sélectionnée */
  selectedRange: CalendarDateRange;
  /** Fonction pour modifier le mode de vue */
  onViewModeChange: (mode: CalendarViewMode) => void;
  /** Fonction pour naviguer dans le calendrier */
  onNavigate: (action: 'prev' | 'next') => void;
}

/**
 * Composant d'en-tête du calendrier avec navigation et contrôles
 * @param props - Propriétés du composant
 * @returns Composant CalendarHeader
 */
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  currentDate,
  selectedRange,
  onViewModeChange,
  onNavigate
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>{formatDateRangeTitle(selectedRange, viewMode, currentDate)}</CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as CalendarViewMode)}
            options={VIEW_OPTIONS}
            className="w-full md:w-48"
          />
          <div className="flex gap-1">
            <button 
              onClick={() => onNavigate('prev')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              aria-label="Période précédente"
            >
              &lt;
            </button>
            <button 
              onClick={() => onNavigate('next')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              aria-label="Période suivante"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      {/* Indicateur de plage de temps sélectionnée */}
      <div className="mt-2 text-sm text-slate-500 flex items-center">
        <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm mr-2"></span>
        <span>Plage de temps sélectionnée: </span>
        <span className="font-medium ml-1">
          {selectedRange.startDate.toLocaleDateString('fr-FR')} - {selectedRange.endDate.toLocaleDateString('fr-FR')}
        </span>
      </div>
    </CardHeader>
  );
};