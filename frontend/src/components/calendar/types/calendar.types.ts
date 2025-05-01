/**
 * Type pour les vues de calendrier
 */
export type CalendarViewMode = 'annual' | 'biannual' | 'fourmonth' | 'quarterly' | 'monthly' | 'biweekly' | 'weekly' | 'daily';

/**
 * Type pour la vue d'affichage du calendrier
 */
export type CalendarDisplayView = 'month' | 'year';

/**
 * Interface pour la configuration des dates du calendrier
 */
export interface CalendarDateRange {
  /** Date de début de la plage */
  startDate: Date;
  /** Date de fin de la plage */
  endDate: Date;
}

/**
 * Props pour les composants de calendrier partagés
 */
export interface BaseCalendarProps {
  /** Classes CSS supplémentaires */
  className?: string;
}