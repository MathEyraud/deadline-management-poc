/**
 * Composant CalendarView
 * Affiche les échéances dans un calendrier interactif avec mise en évidence de la plage sélectionnée
 * @module components/calendar/CalendarView
 */
'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Deadline, DeadlinePriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Modal, Select } from '@/components/ui';
import DeadlineForm from '../deadline/DeadlineForm';
import { useDeadlinesList } from '@/hooks/useDeadlines';

/**
 * Type Value pour le calendrier
 */
type Value = Date | null | [Date | null, Date | null];

/**
 * Type de vue de calendrier
 */
type CalendarViewMode = 'annual' | 'biannual' | 'fourmonth' | 'quarterly' | 'monthly' | 'biweekly' | 'weekly' | 'daily';

/**
 * Props pour le composant CalendarView
 */
interface CalendarViewProps {
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Obtient la couleur de badge en fonction de la priorité
 * @param priority - Priorité de l'échéance
 * @returns Variante de badge correspondante
 */
const getPriorityBadgeVariant = (priority: string) => {
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
};

/**
 * Composant CalendarView - Calendrier interactif des échéances avec mise en évidence de la plage sélectionnée
 * @param props - Propriétés du composant
 * @returns Composant CalendarView
 */
export const CalendarView = ({ className = '' }: CalendarViewProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');
  const [dateRange, setDateRange] = useState<[Date, Date]>(getDateRangeForView('monthly', date));
  // État pour suivre la plage active/sélectionnée pour la mise en évidence
  const [selectedRange, setSelectedRange] = useState<[Date, Date]>(dateRange);
  
  // Fetch deadlines data
  const { data: deadlines = [], refetch } = useDeadlinesList();

  /**
   * Calcule la plage de dates pour la vue sélectionnée
   * @param view - Type de vue
   * @param baseDate - Date de référence
   * @returns Plage de dates [début, fin]
   */
  function getDateRangeForView(view: CalendarViewMode, baseDate: Date): [Date, Date] {
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
    
    return [startDate, endDate];
  }

  /**
   * Détermine la vue du calendrier en fonction du mode sélectionné
   * @param viewMode - Mode de vue
   * @returns Type de vue du calendrier ('month' ou 'year')
   */
  function getCalendarViewFromMode(viewMode: CalendarViewMode): 'month' | 'year' {
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

  // Mettre à jour la plage de dates quand la vue change
  useEffect(() => {
    const newDateRange = getDateRangeForView(viewMode, date);
    setDateRange(newDateRange);
    setSelectedRange(newDateRange); // Mettre également à jour la plage sélectionnée

    // Mettre à jour calendarView en fonction de viewMode
    setCalendarView(getCalendarViewFromMode(viewMode));

  }, [viewMode, date]);

  // Filtrer les échéances pour la plage de dates sélectionnée
  const getDeadlinesForDateRange = () => {
    const [startDate, endDate] = selectedRange; // Utiliser la plage sélectionnée plutôt que dateRange
    
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.deadlineDate);
      return deadlineDate >= startDate && deadlineDate <= endDate;
    }).sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());
  };

  // Filtrer les échéances pour une date spécifique
  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.deadlineDate);
      return (
        deadlineDate.getDate() === date.getDate() &&
        deadlineDate.getMonth() === date.getMonth() &&
        deadlineDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Échéances pour la période sélectionnée
  const selectedPeriodDeadlines = viewMode === 'daily' 
    ? getDeadlinesForDate(date)
    : getDeadlinesForDateRange();

  // Est-ce qu'une date a des échéances (pour le style)
  const tileHasDeadline = ({ date, view }: { date: Date; view: string }) => {
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
  };

  // Options de vue du calendrier
  const viewOptions = [
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
   * Détermine si une date est dans la plage sélectionnée
   * @param date - Date à vérifier
   * @returns true si la date est dans la plage sélectionnée
   */
  const isDateInSelectedRange = (date: Date): boolean => {
    const [start, end] = selectedRange;
    const startTime = start.setHours(0, 0, 0, 0);
    const endTime = end.setHours(23, 59, 59, 999);
    const dateTime = new Date(date).setHours(12, 0, 0, 0); // Midi pour éviter les problèmes de fuseau horaire
    
    return dateTime >= startTime && dateTime <= endTime;
  };

  /**
   * Classe pour chaque tuile du calendrier, avec mise en évidence de la plage sélectionnée
   * @param date - Date de la tuile
   * @param view - Type de vue (month/year)
   * @returns Classes CSS pour la tuile
   */
  const tileClassName = ({ date, view }: { date: Date; view: string }): string => {
    const classes = [];
    
    // Ajouter une classe si la tuile a des échéances
    if (tileHasDeadline({ date, view })) {
      classes.push('has-deadlines');
    }
    
    // Ajouter une classe si la date est dans la plage sélectionnée
    if (isDateInSelectedRange(date)) {
      classes.push('in-selected-range');
      
      // Ajouter des classes spécifiques pour le début et la fin de la plage
      const [start, end] = selectedRange;
      
      // Vérifier si c'est le début de la plage (même jour)
      if (date.getDate() === start.getDate() && 
          date.getMonth() === start.getMonth() && 
          date.getFullYear() === start.getFullYear()) {
        classes.push('range-start');
      }
      
      // Vérifier si c'est la fin de la plage (même jour)
      if (date.getDate() === end.getDate() && 
          date.getMonth() === end.getMonth() && 
          date.getFullYear() === end.getFullYear()) {
        classes.push('range-end');
      }
    }
    
    return classes.join(' ');
  };

  // Navigation dans le calendrier
  const handleNavigate = (action: 'prev' | 'next') => {
    const newDate = new Date(date);
    
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
        newDate.setDate(newDate.getDate() + (action === 'next' ? 15 : -15));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (action === 'next' ? 7 : -7));
        break;
      case 'daily':
        newDate.setDate(newDate.getDate() + (action === 'next' ? 1 : -1));
        break;
    }
    
    setDate(newDate);
  };

  // Gestionnaire de changement de date spécifiquement amélioré pour la mise en évidence
  const handleDateChange = (value: Value) => {
    // Cas d'une date unique sélectionnée
    if (value instanceof Date) {
      setDate(value);
      
      // Si on est en vue quotidienne, mettre à jour la plage sélectionnée
      if (viewMode === 'daily') {
        const newRange: [Date, Date] = [
          new Date(value.setHours(0, 0, 0, 0)),
          new Date(new Date(value).setHours(23, 59, 59, 999))
        ];
        setSelectedRange(newRange);
      }
    } 
    // Cas d'une plage (utilisé pour les vues comme "week" ou "month" dans certaines configurations de react-calendar)
    else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
      
      if (value.length === 2 && value[1] instanceof Date) {
        // Mise à jour de la plage sélectionnée avec les heures correctement définies
        const newRange: [Date, Date] = [
          new Date(new Date(value[0]).setHours(0, 0, 0, 0)),
          new Date(new Date(value[1]).setHours(23, 59, 59, 999))
        ];
        setSelectedRange(newRange);
      }
    }
  };

  // Formatter le titre de la période affichée
  const formatDateRangeTitle = () => {
    // Utiliser la plage sélectionnée plutôt que dateRange
    const [start, end] = selectedRange;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    
    switch (viewMode) {
      case 'annual':
        return `Année ${start.getFullYear()}`;
      case 'biannual':
        return `${start.getMonth() < 6 ? '1er' : '2ème'} semestre ${start.getFullYear()}`;
      case 'fourmonth':
        const quadrimester = Math.floor(start.getMonth() / 4) + 1;
        return `${quadrimester}${quadrimester === 1 ? 'er' : 'ème'} quadrimestre ${start.getFullYear()}`;
      case 'quarterly':
        const quarter = Math.floor(start.getMonth() / 3) + 1;
        return `${quarter}${quarter === 1 ? 'er' : 'ème'} trimestre ${start.getFullYear()}`;
      case 'monthly':
        return start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'biweekly':
        const isFirstHalf = start.getDate() === 1;
        return `${isFirstHalf ? '1ère' : '2ème'} quinzaine de ${start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
      case 'weekly':
        return `Semaine du ${start.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`;
      case 'daily':
        return `${date.toLocaleDateString('fr-FR', options)}`;
      default:
        return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
    }
  };

  // Formatage de la date pour l'affichage détaillé
  const formatDeadlineDate = (deadlineDate: string | Date) => {
    const date = new Date(deadlineDate);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>{formatDateRangeTitle()}</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as CalendarViewMode)}
                options={viewOptions}
                className="w-full md:w-48"
              />
              <div className="flex gap-1">
                <button 
                  onClick={() => handleNavigate('prev')}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
                  aria-label="Période précédente"
                >
                  &lt;
                </button>
                <button 
                  onClick={() => handleNavigate('next')}
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
              {selectedRange[0].toLocaleDateString('fr-FR')} - {selectedRange[1].toLocaleDateString('fr-FR')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="calendar-container mb-4">
            <Calendar
              onChange={handleDateChange}
              value={date}
              locale="fr-FR"
              tileClassName={tileClassName}
              calendarType="iso8601"
              view={calendarView}
              selectRange={viewMode !== 'daily'}
              onClickDay={(value) => {
                // Si nous sommes en vue journalière ou si nous cliquons sur une date spécifique
                setDate(value);
                
                // En vue journalière, définir une plage d'un seul jour
                const newRange: [Date, Date] = [
                  new Date(new Date(value).setHours(0, 0, 0, 0)),
                  new Date(new Date(value).setHours(23, 59, 59, 999))
                ];
                setSelectedRange(newRange);
                
                // Si nous ne sommes pas déjà en vue journalière, passer en vue journalière
                if (viewMode !== 'daily') {
                  setViewMode('daily');
                }
              }}
              onClickMonth={(value) => {
                setDate(value);
                // Si on est dans une vue année, passer à la vue mois
                if (['annual', 'biannual', 'fourmonth', 'quarterly'].includes(viewMode)) {
                  setViewMode('monthly');
                }
              }}
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
      </Card>

      {/* Liste des échéances pour la période sélectionnée */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>
              {viewMode === 'daily' 
                ? `Échéances du ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` 
                : `Échéances pour ${formatDateRangeTitle()}`
              }
            </CardTitle>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Ajouter une échéance
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedPeriodDeadlines.length === 0 ? (
            <p className="text-slate-500 text-center py-6">
              {viewMode === 'daily' 
                ? "Aucune échéance pour cette journée." 
                : "Aucune échéance pour cette période."
              }
            </p>
          ) : (
            <div className="space-y-3">
              {selectedPeriodDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    setSelectedDeadline(deadline);
                    setIsEditModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{deadline.title}</h3>
                    <Badge variant={getPriorityBadgeVariant(deadline.priority)}>
                      {deadline.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDeadlineDate(deadline.deadlineDate)}
                  </p>
                  {deadline.description && (
                    <p className="text-sm mt-2 text-slate-700 line-clamp-2">
                      {deadline.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for creating new deadline */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer une nouvelle échéance"
        size="lg"
      >
        <DeadlineForm
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
          mode="create"
        />
      </Modal>

      {/* Modal for editing deadline */}
      <Modal
        isOpen={isEditModalOpen && !!selectedDeadline}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'échéance"
        size="lg"
      >
        {selectedDeadline && (
          <DeadlineForm
            deadline={selectedDeadline}
            onSuccess={() => {
              setIsEditModalOpen(false);
              refetch();
            }}
            mode="edit"
          />
        )}
      </Modal>
    </div>
  );
};

export default CalendarView;