/**
 * Composant CalendarView
 * Affiche les échéances dans un calendrier interactif
 * @module components/calendar/CalendarView
 */
'use client';

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Deadline, DeadlinePriority } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Select, Modal } from '@/components/ui';
import DeadlineForm from '../deadline/DeadlineForm';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { formatDate } from '@/lib/utils';

/**
 * Type Value pour le calendrier
 */
type Value = Date | null | [Date | null, Date | null];

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
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  // Fetch deadlines data
  const { data: deadlines = [], refetch } = useDeadlinesList();

  // Filtrer les échéances pour la date sélectionnée
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

  // Échéances pour la date sélectionnée
  const selectedDateDeadlines = getDeadlinesForDate(date);

  // Est-ce qu'une date a des échéances (pour le style)
  const tileHasDeadline = ({ date }: { date: Date }) => {
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
    { value: 'month', label: 'Mois' },
    { value: 'week', label: 'Semaine' },
    { value: 'day', label: 'Jour' },
  ];

  // Classe pour chaque tuile du calendrier
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && tileHasDeadline({ date })) {
      return 'has-deadlines';
    }
    return null;
  };

  // Gestionnaire de changement de date correctement typé
  const handleDateChange = (value: Value, event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date) {
      setDate(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
    }
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Calendrier des échéances</CardTitle>
            <div className="w-32">
              <Select
                options={viewOptions}
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}
              />
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
              onClickDay={(value, event) => {
                setDate(value);
                // Si on est en vue mois, passer en vue jour après clic
                if (viewMode === 'month') {
                  setViewMode('day');
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
            `}</style>
          </div>
        </CardContent>
      </Card>

      {/* Liste des échéances pour la date sélectionnée */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Échéances du {formatDate(date)}</CardTitle>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Ajouter une échéance
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedDateDeadlines.length === 0 ? (
            <p className="text-slate-500 text-center py-6">
              Aucune échéance pour cette date.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateDeadlines.map((deadline) => (
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
                    {new Date(deadline.deadlineDate).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {deadline.description && (
                    <p className="text-sm mt-2 text-slate-700">{deadline.description}</p>
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