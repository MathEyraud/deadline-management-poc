import { useState, useEffect, useCallback } from 'react';
import { CalendarViewMode, CalendarDateRange, CalendarDisplayView } from '../types/calendar.types';
import { getDateRangeForView, getCalendarViewFromMode } from '../utils/calendarUtils';

/**
 * Interface de retour du hook useCalendarNavigation
 */
interface UseCalendarNavigationReturn {
  /** Date actuelle sélectionnée */
  currentDate: Date;
  /** Mode de vue actuel */
  viewMode: CalendarViewMode;
  /** Vue d'affichage du calendrier */
  calendarView: CalendarDisplayView;
  /** Plage de dates pour la vue actuelle */
  dateRange: CalendarDateRange;
  /** Plage de dates sélectionnée */
  selectedRange: CalendarDateRange;
  /** Modifier la date actuelle */
  setCurrentDate: (date: Date) => void;
  /** Modifier le mode de vue */
  setViewMode: (mode: CalendarViewMode) => void;
  /** Modifier la plage sélectionnée */
  setSelectedRange: (range: CalendarDateRange) => void;
  /** Navigation dans le calendrier */
  navigate: (action: 'prev' | 'next') => void;
  /** Mettre à jour la date et la plage sélectionnée */
  handleDateChange: (value: Date | null | [Date | null, Date | null]) => void;
}

/**
 * Hook personnalisé pour gérer la navigation du calendrier
 * @param initialDate - Date initiale
 * @param initialViewMode - Mode de vue initial
 * @returns Fonctions et états pour la navigation du calendrier
 */
export function useCalendarNavigation(
  initialDate: Date = new Date(),
  initialViewMode: CalendarViewMode = 'monthly'
): UseCalendarNavigationReturn {
  // États
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialViewMode);
  const [calendarView, setCalendarView] = useState<CalendarDisplayView>(
    getCalendarViewFromMode(initialViewMode)
  );
  const [dateRange, setDateRange] = useState<CalendarDateRange>(
    getDateRangeForView(initialViewMode, initialDate)
  );
  const [selectedRange, setSelectedRange] = useState<CalendarDateRange>(
    getDateRangeForView(initialViewMode, initialDate)
  );

  // Mettre à jour la plage de dates et la vue quand la date ou le mode change
  useEffect(() => {
    const newDateRange = getDateRangeForView(viewMode, currentDate);
    setDateRange(newDateRange);
    setSelectedRange(newDateRange);
    setCalendarView(getCalendarViewFromMode(viewMode));
  }, [viewMode, currentDate]);

  /**
   * Navigation dans le calendrier
   * @param action - Direction de navigation ('prev' ou 'next')
   */
  const navigate = useCallback((action: 'prev' | 'next') => {
    // Créer une nouvelle date basée sur la date actuelle
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'annual':
        newDate.setFullYear(newDate.getFullYear() + (action === 'next' ? 1 : -1));
        break;
      case 'biannual':
        newDate.setMonth(newDate.getMonth() + (action === 'next' ? 6 : -6));
        break;
      case 'fourmonth':
        newDate.setMonth(newDate.getMonth() + (action === 'next' ? 4 : -4));
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + (action === 'next' ? 3 : -3));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (action === 'next' ? 1 : -1));
        break;
      case 'biweekly':
        newDate.setDate(newDate.getDate() + (action === 'next' ? 14 : -14));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (action === 'next' ? 7 : -7));
        break;
      case 'daily':
        newDate.setDate(newDate.getDate() + (action === 'next' ? 1 : -1));
        break;
    }
    
    // Mettre à jour la date courante (cela déclenchera également la mise à jour des plages via useEffect)
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  /**
   * Gestionnaire de changement de date amélioré
   * @param value - Nouvelle valeur de date
   */
  const handleDateChange = useCallback((value: Date | null | [Date | null, Date | null]) => {
    // Cas d'une date unique sélectionnée
    if (value instanceof Date) {
      setCurrentDate(value);
      
      // Si on est en vue quotidienne, mettre à jour la plage sélectionnée
      if (viewMode === 'daily') {
        const startDate = new Date(value);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(value);
        endDate.setHours(23, 59, 59, 999);
        
        setSelectedRange({ startDate, endDate });
      }
    } 
    // Cas d'une plage (utilisé pour les vues comme "week" ou "month")
    else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setCurrentDate(value[0]);
      
      if (value.length === 2 && value[1] instanceof Date) {
        // Mise à jour de la plage sélectionnée avec les heures correctement définies
        const startDate = new Date(value[0]);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(value[1]);
        endDate.setHours(23, 59, 59, 999);
        
        setSelectedRange({ startDate, endDate });
      }
    }
  }, [viewMode]);

  return {
    currentDate,
    viewMode,
    calendarView,
    dateRange,
    selectedRange,
    setCurrentDate,
    setViewMode,
    setSelectedRange,
    navigate,
    handleDateChange
  };
}