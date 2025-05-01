import React from 'react';
import { CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import { CalendarViewMode, CalendarDateRange } from './types/calendar.types';
import { Deadline } from '@/types';
import { formatDeadlineDate, getPriorityBadgeVariant } from './utils/calendarUtils';

/**
 * Props pour le composant DeadlinesList
 */
interface DeadlinesListProps {
  /** Liste des échéances à afficher */
  deadlines: Deadline[];
  /** Mode de vue actuel */
  viewMode: CalendarViewMode;
  /** Date actuelle */
  currentDate: Date;
  /** Plage de dates sélectionnée */
  selectedRange: CalendarDateRange;
  /** Fonction appelée pour ouvrir le modal de création */
  onOpenCreateModal: () => void;
  /** Fonction appelée pour ouvrir le modal d'édition */
  onOpenEditModal: (deadline: Deadline) => void;
  /** Titre optionnel pour la section */
  title?: string;
}

/**
 * Composant pour afficher la liste des échéances d'une période
 * @param props - Propriétés du composant
 * @returns Composant DeadlinesList
 */
export const DeadlinesList: React.FC<DeadlinesListProps> = ({
  deadlines,
  viewMode,
  currentDate,
  selectedRange,
  onOpenCreateModal,
  onOpenEditModal,
  title
}) => {
  /**
   * Titre par défaut basé sur la vue et la date
   */
  const defaultTitle = viewMode === 'daily' 
    ? `Échéances du ${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` 
    : 'Échéances pour la période sélectionnée';

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>
            {title || defaultTitle}
          </CardTitle>
          <button
            onClick={onOpenCreateModal}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Ajouter une échéance
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-slate-500 text-center py-6">
            {viewMode === 'daily' 
              ? "Aucune échéance pour cette journée." 
              : "Aucune échéance pour cette période."
            }
          </p>
        ) : (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                className="p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                onClick={() => onOpenEditModal(deadline)}
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
    </>
  );
};