import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CardContent } from '@/components/ui';
import { CalendarViewMode, CalendarDateRange, CalendarDisplayView } from './types/calendar.types';
import { Deadline } from '@/types';
import { dateHasDeadlines, isDateInSelectedRange } from './utils/calendarUtils';

/**
 * Props pour le composant CalendarGrid
 */
interface CalendarGridProps {
  /** Date actuellement sélectionnée */
  value: Date;
  /** Type de vue du calendrier */
  view: CalendarDisplayView;
  /** Mode de vue actuel */
  viewMode: CalendarViewMode;
  /** Plage sélectionnée */
  selectedRange: CalendarDateRange;
  /** Liste des échéances */
  deadlines: Deadline[];
  /** Fonction appelée lors du changement de date */
  onChange: (value: Date | null | [Date | null, Date | null]) => void;
  /** Fonction pour le clic sur un jour */
  onClickDay?: (value: Date) => void;
  /** Fonction pour le clic sur un mois */
  onClickMonth?: (value: Date) => void;
}

/**
 * Composant d'affichage du calendrier avec personnalisation
 * @param props - Propriétés du composant
 * @returns Composant CalendarGrid
 */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
  value,
  view,
  viewMode,
  selectedRange,
  deadlines,
  onChange,
  onClickDay,
  onClickMonth
}) => {
  /**
   * Classe pour chaque tuile du calendrier, avec mise en évidence de la plage sélectionnée
   * @param date - Date de la tuile
   * @param view - Type de vue (month/year)
   * @returns Classes CSS pour la tuile
   */
  const tileClassName = ({ date, view: tileView }: { date: Date; view: string }): string => {
    const classes = [];
    
    // Ajouter une classe si la tuile a des échéances
    if (dateHasDeadlines(date, tileView, deadlines)) {
      classes.push('has-deadlines');
    }
    
    // Ajouter une classe si la date est dans la plage sélectionnée
    if (isDateInSelectedRange(date, selectedRange)) {
      classes.push('in-selected-range');
      
      // Ajouter des classes spécifiques pour le début et la fin de la plage
      const { startDate, endDate } = selectedRange;
      
      // Vérifier si c'est le début de la plage (même jour)
      if (date.getDate() === startDate.getDate() && 
          date.getMonth() === startDate.getMonth() && 
          date.getFullYear() === startDate.getFullYear()) {
        classes.push('range-start');
      }
      
      // Vérifier si c'est la fin de la plage (même jour)
      if (date.getDate() === endDate.getDate() && 
          date.getMonth() === endDate.getMonth() && 
          date.getFullYear() === endDate.getFullYear()) {
        classes.push('range-end');
      }
    }
    
    return classes.join(' ');
  };

  return (
    <CardContent>
      <div className="calendar-container mb-4">
        <Calendar
          onChange={onChange}
          value={value}
          locale="fr-FR"
          tileClassName={tileClassName}
          calendarType="iso8601"
          view={view}
          selectRange={viewMode !== 'daily'}
          onClickDay={onClickDay}
          onClickMonth={onClickMonth}
        />
        <style jsx global>{`
          .react-calendar {
            width: 100%;
            border: none;
            font-family: inherit;
          }
          
          /* Style de base pour les tuiles actives */
          .react-calendar__tile--active {
            background-color: #3b82f6 !important;
            color: white;
          }
          
          /* Style pour les tuiles avec des échéances */
          .react-calendar__tile.has-deadlines {
            position: relative;
          }
          
          .react-calendar__tile.has-deadlines::after {
            content: '';
            position: absolute;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #3b82f6;
          }
          
          .react-calendar__year-view .react-calendar__tile.has-deadlines::after {
            width: 8px;
            height: 8px;
          }
          
          /* Style pour les tuiles dans la plage sélectionnée */
          .react-calendar__tile.in-selected-range {
            background-color: #dbeafe !important;
            color: #1e40af;
            position: relative;
            z-index: 1;
          }
          
          /* Style spécifique pour le début de la plage */
          .react-calendar__tile.range-start {
            background-color: #bfdbfe !important;
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
            font-weight: 600;
          }
          
          /* Style spécifique pour la fin de la plage */
          .react-calendar__tile.range-end {
            background-color: #bfdbfe !important;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            font-weight: 600;
          }
          
          /* Style pour la date active et dans la plage */
          .react-calendar__tile--active.in-selected-range {
            color: white !important;
            font-weight: 600;
          }
        `}</style>
      </div>
    </CardContent>
  );
};