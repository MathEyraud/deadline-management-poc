import { BadgeProps } from '@/components/ui';
import { CalendarViewMode, CalendarDateRange, CalendarDisplayView } from '../types/calendar.types';
import { Deadline, DeadlinePriority } from '@/types';

/**
 * Calcule la plage de dates pour la vue sélectionnée
 * @param view - Type de vue
 * @param baseDate - Date de référence
 * @returns Plage de dates [début, fin]
 */
export function getDateRangeForView(view: CalendarViewMode, baseDate: Date): CalendarDateRange {
  const startDate = new Date(baseDate);
  const endDate = new Date(baseDate);
  
  switch (view) {
    case 'annual':
      startDate.setMonth(0, 1); // 1er janvier
      startDate.setHours(0, 0, 0, 0);
      endDate.setFullYear(startDate.getFullYear() + 1);
      endDate.setMonth(0, 0); // 31 décembre
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'biannual':
      // Premier ou deuxième semestre
      const isSemester1 = baseDate.getMonth() < 6;
      startDate.setMonth(isSemester1 ? 0 : 6, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(isSemester1 ? 5 : 11, 30);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'fourmonth':
      // Quadrimestres: jan-avr, mai-août, sep-déc
      const quadrimester = Math.floor(baseDate.getMonth() / 4);
      startDate.setMonth(quadrimester * 4, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(quadrimester * 4 + 3, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'quarterly':
      // Trimestres: jan-mar, avr-juin, juil-sep, oct-déc
      const quarter = Math.floor(baseDate.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(quarter * 3 + 2, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'monthly':
      // Vue mensuelle standard
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(startDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'biweekly':
      // Bimensuel: 1ère ou 2ème quinzaine du mois
      const day = baseDate.getDate();
      const isFirstHalf = day <= 15;
      startDate.setDate(isFirstHalf ? 1 : 16);
      startDate.setHours(0, 0, 0, 0);
      if (isFirstHalf) {
        endDate.setDate(15);
      } else {
        endDate.setMonth(startDate.getMonth() + 1, 0);
      }
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'weekly':
      // Vue hebdomadaire: lundi à dimanche (calendrier ISO 8601)
      const dayOfWeek = startDate.getDay() || 7; // getDay retourne 0 pour dimanche, mais en ISO 8601 c'est 7
      const diff = dayOfWeek - 1; // Différence par rapport au lundi (1er jour)
      
      // Régler startDate au lundi de la semaine en cours
      startDate.setDate(startDate.getDate() - diff);
      startDate.setHours(0, 0, 0, 0);
      
      // Régler endDate au dimanche (startDate + 6 jours)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'daily':
      // Vue journalière: un seul jour
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  
  return { startDate, endDate };
}

/**
 * Détermine la vue du calendrier en fonction du mode sélectionné
 * @param viewMode - Mode de vue
 * @returns Type de vue du calendrier ('month' ou 'year')
 */
export function getCalendarViewFromMode(viewMode: CalendarViewMode): CalendarDisplayView {
  switch (viewMode) {
    case 'annual':
    case 'biannual':
    case 'fourmonth':
    case 'quarterly':
      return 'year';
    default:
      return 'month';
  }
}

/**
 * Filtrer les échéances pour une plage de dates
 * @param deadlines - Liste des échéances
 * @param dateRange - Plage de dates
 * @returns Liste filtrée des échéances
 */
export function filterDeadlinesForDateRange(deadlines: Deadline[], dateRange: CalendarDateRange): Deadline[] {
  const { startDate, endDate } = dateRange;
  
  return deadlines.filter(deadline => {
    const deadlineDate = new Date(deadline.deadlineDate);
    return deadlineDate >= startDate && deadlineDate <= endDate;
  }).sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());
}

/**
 * Filtrer les échéances pour une date spécifique
 * @param deadlines - Liste des échéances
 * @param date - Date spécifique
 * @returns Liste filtrée des échéances
 */
export function filterDeadlinesForDate(deadlines: Deadline[], date: Date): Deadline[] {
  return deadlines.filter(deadline => {
    const deadlineDate = new Date(deadline.deadlineDate);
    return (
      deadlineDate.getDate() === date.getDate() &&
      deadlineDate.getMonth() === date.getMonth() &&
      deadlineDate.getFullYear() === date.getFullYear()
    );
  });
}

/**
 * Verifier si une date contient des échéances
 * @param date - Date à vérifier
 * @param view - Vue actuelle
 * @param deadlines - Liste des échéances
 * @returns true si la date contient des échéances
 */
export function dateHasDeadlines(date: Date, view: string, deadlines: Deadline[]): boolean {
  // Pour la vue année, vérifier si le mois contient des échéances
  if (view === 'year') {
    return deadlines.some(deadline => {
      const deadlineDate = new Date(deadline.deadlineDate);
      return (
        deadlineDate.getMonth() === date.getMonth() &&
        deadlineDate.getFullYear() === date.getFullYear()
      );
    });
  }
  
  // Pour la vue mois, vérifier si le jour contient des échéances
  return deadlines.some(deadline => {
    const deadlineDate = new Date(deadline.deadlineDate);
    return (
      deadlineDate.getDate() === date.getDate() &&
      deadlineDate.getMonth() === date.getMonth() &&
      deadlineDate.getFullYear() === date.getFullYear()
    );
  });
}

/**
 * Détermine si une date est dans la plage sélectionnée
 * @param date - Date à vérifier
 * @param selectedRange - Plage sélectionnée
 * @returns true si la date est dans la plage sélectionnée
 */
export function isDateInSelectedRange(date: Date, selectedRange: CalendarDateRange): boolean {
  const { startDate, endDate } = selectedRange;
  const startTime = new Date(startDate).setHours(0, 0, 0, 0);
  const endTime = new Date(endDate).setHours(23, 59, 59, 999);
  const dateTime = new Date(date).setHours(12, 0, 0, 0); // Midi pour éviter les problèmes de fuseau horaire
  
  return dateTime >= startTime && dateTime <= endTime;
}

/**
 * Formatter le titre de la période affichée
 * @param selectedRange - Plage sélectionnée
 * @param viewMode - Mode de vue
 * @param currentDate - Date actuelle
 * @returns Titre formaté
 */
export function formatDateRangeTitle(
  selectedRange: CalendarDateRange,
  viewMode: CalendarViewMode,
  currentDate: Date
): string {
  const { startDate, endDate } = selectedRange;
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  
  switch (viewMode) {
    case 'annual':
      return `Année ${startDate.getFullYear()}`;
    case 'biannual':
      return `${startDate.getMonth() < 6 ? '1er' : '2ème'} semestre ${startDate.getFullYear()}`;
    case 'fourmonth':
      const quadrimester = Math.floor(startDate.getMonth() / 4) + 1;
      return `${quadrimester}${quadrimester === 1 ? 'er' : 'ème'} quadrimestre ${startDate.getFullYear()}`;
    case 'quarterly':
      const quarter = Math.floor(startDate.getMonth() / 3) + 1;
      return `${quarter}${quarter === 1 ? 'er' : 'ème'} trimestre ${startDate.getFullYear()}`;
    case 'monthly':
      return startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    case 'biweekly':
      const isFirstHalf = startDate.getDate() === 1;
      return `${isFirstHalf ? '1ère' : '2ème'} quinzaine de ${startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    case 'weekly':
      return `Semaine du ${startDate.toLocaleDateString('fr-FR', options)} au ${endDate.toLocaleDateString('fr-FR', options)}`;
    case 'daily':
      return `${currentDate.toLocaleDateString('fr-FR', options)}`;
    default:
      return `${startDate.toLocaleDateString('fr-FR', options)} - ${endDate.toLocaleDateString('fr-FR', options)}`;
  }
}

/**
 * Formatage de la date pour l'affichage détaillé
 * @param deadlineDate - Date de l'échéance
 * @returns Date formatée pour l'affichage
 */
export function formatDeadlineDate(deadlineDate: string | Date): string {
  const date = new Date(deadlineDate);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtient la couleur de badge en fonction de la priorité
 * @param priority - Priorité de l'échéance
 * @returns Variante de badge correspondante
 */
export function getPriorityBadgeVariant(priority: string): BadgeProps['variant'] {
    switch (priority) {
      case DeadlinePriority.CRITICAL:
        return 'danger';
      case DeadlinePriority.HIGH:
        return 'warning';
      case DeadlinePriority.MEDIUM:
        return 'primary';
      case DeadlinePriority.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  }