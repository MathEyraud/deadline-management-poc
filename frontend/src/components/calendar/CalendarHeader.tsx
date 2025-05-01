import React, { useMemo } from 'react';
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
 * Noms des mois en français
 */
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
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
  /** Fonction pour définir directement une date */
  onDateChange: (date: Date) => void;
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
  onNavigate,
  onDateChange
}) => {
  // Détermine quels sélecteurs afficher en fonction du mode de vue
  const showYearSelector = true; // Toujours afficher le sélecteur d'année
  const showMonthSelector = ['monthly', 'biweekly', 'weekly', 'daily'].includes(viewMode);

  // Générer les options d'années (10 ans avant et après l'année actuelle)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 20; year <= currentYear + 50; year++) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  }, []);

  // Générer les options de mois
  const monthOptions = useMemo(() => 
    MONTH_NAMES.map((month, index) => ({
      value: index.toString(),
      label: month
    })), 
  []);

  /**
   * Vérifie si une année est bissextile
   * @param year - L'année à vérifier
   * @returns true si l'année est bissextile
   */
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Gestionnaires pour les changements de mois et d'année
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    
    // Gérer le cas où le jour actuel n'existe pas dans le nouveau mois
    // Par exemple, 31 janvier -> 28/29 février
    const monthDays = new Date(newDate.getFullYear(), newMonth + 1, 0).getDate();
    if (newDate.getDate() > monthDays) {
      newDate.setDate(monthDays);
    }
    
    onDateChange(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    
    // Gérer le cas du 29 février dans une année non bissextile
    if (newDate.getMonth() === 1 && newDate.getDate() === 29 && !isLeapYear(newYear)) {
      newDate.setDate(28);
    }
    
    onDateChange(newDate);
  };

  return (
    <CardHeader className="pb-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="mb-2 md:mb-0">{formatDateRangeTitle(selectedRange, viewMode, currentDate)}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {/* Premier groupe: mode de vue et sélecteurs de date */}
          <div className="flex flex-wrap items-center gap-2 mr-0 md:mr-2">
            <Select
              value={viewMode}
              onChange={(e) => onViewModeChange(e.target.value as CalendarViewMode)}
              options={VIEW_OPTIONS}
              className="w-full sm:w-40"
            />
            
            {/* Sélecteurs de mois et d'année */}
            <div className="flex items-center gap-1 mt-2 sm:mt-0">
              {showMonthSelector && (
                <Select
                  value={currentDate.getMonth().toString()}
                  onChange={handleMonthChange}
                  options={monthOptions}
                  className="w-28 sm:w-32"
                  aria-label="Sélectionner le mois"
                />
              )}
              {showYearSelector && (
                <Select
                  value={currentDate.getFullYear().toString()}
                  onChange={handleYearChange}
                  options={yearOptions}
                  className="w-20 sm:w-24"
                  aria-label="Sélectionner l'année"
                />
              )}
            </div>
          </div>
          
          {/* Deuxième groupe: boutons de navigation */}
          <div className="flex gap-1 mt-2 md:mt-0">
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