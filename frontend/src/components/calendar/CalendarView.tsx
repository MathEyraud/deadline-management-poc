/**
 * Composant CalendarView
 * Affiche les échéances dans un calendrier interactif
 * @module components/calendar/CalendarView
 */
'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Deadline, DeadlinePriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Select, Modal } from '@/components/ui';
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
 * Composant CalendarView - Calendrier interactif des échéances
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
        // Vue hebdomadaire: dimanche à samedi
        const dayOfWeek = baseDate.getDay();
        startDate.setDate(baseDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
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
    setDateRange(getDateRangeForView(viewMode, date));

    // Mettre à jour calendarView en fonction de viewMode
    setCalendarView(getCalendarViewFromMode(viewMode));

  }, [viewMode, date]);

  // Filtrer les échéances pour la plage de dates sélectionnée
  const getDeadlinesForDateRange = () => {
    const [startDate, endDate] = dateRange;
    
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

  // Classe pour chaque tuile du calendrier
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (tileHasDeadline({ date, view })) {
      return 'has-deadlines';
    }
    return null;
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

  // Gestionnaire de changement de date correctement typé
  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setDate(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
    }
  };

  // Formatter le titre de la période affichée
  const formatDateRangeTitle = () => {
    const [start, end] = dateRange;
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
              onClickDay={(value) => {
                setDate(value);
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
              .react-calendar__tile--active {
                background-color: #3b82f6 !important;
                color: white;
              }
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