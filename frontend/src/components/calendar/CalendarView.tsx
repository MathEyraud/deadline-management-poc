/**
 * Composant CalendarView - Calendrier interactif des échéances avec une architecture modulaire
 * @module components/calendar/CalendarView
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui';
import { useDeadlinesList } from '@/hooks/useDeadlines';
import { Deadline } from '@/types';

// Imports des composants refactorisés
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { DeadlinesList } from './DeadlinesList';
import { AddDeadlineModal, EditDeadlineModal } from './modals';
import { useCalendarNavigation } from './hooks/useCalendarNavigation';
import { filterDeadlinesForDateRange, filterDeadlinesForDate } from './utils/calendarUtils';

/**
 * Props pour le composant CalendarView
 */
interface CalendarViewProps {
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant CalendarView - Calendrier interactif des échéances avec une architecture modulaire
 * @param props - Propriétés du composant
 * @returns Composant CalendarView
 */
export const CalendarView: React.FC<CalendarViewProps> = ({ className = '' }) => {
  // État pour les modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  
  // État local pour la date actuellement sélectionnée dans le calendrier
  const [calendarValue, setCalendarValue] = useState<Date>(new Date());
  
  // Utilisation du hook de navigation
  const {
    currentDate,
    viewMode,
    calendarView,
    dateRange,
    selectedRange,
    setViewMode,
    navigate,
    handleDateChange
  } = useCalendarNavigation(new Date(), 'monthly');
  
  // Mettre à jour la valeur du calendrier lorsque currentDate change
  useEffect(() => {
    setCalendarValue(currentDate);
  }, [currentDate]);
  
  // Récupération des échéances
  const { data: deadlines = [], refetch } = useDeadlinesList();

  // Fonction pour le clic sur un jour - améliorée pour maintenir la synchronisation
  const handleClickDay = (value: Date) => {
    handleDateChange(value);
    setCalendarValue(value); // Mettre à jour la valeur affichée dans le calendrier
    
    // Si on n'est pas déjà en vue journalière, passer en vue journalière
    if (viewMode !== 'daily') {
      setViewMode('daily');
    }
  };
  
  // Fonction pour le clic sur un mois - améliorée pour maintenir la synchronisation
  const handleClickMonth = (value: Date) => {
    handleDateChange(value);
    setCalendarValue(value); // Mettre à jour la valeur affichée dans le calendrier
    
    // Si on est en vue année, passer à la vue mois
    if (['annual', 'biannual', 'fourmonth', 'quarterly'].includes(viewMode)) {
      setViewMode('monthly');
    }
  };
  
  // Fonction améliorée pour la navigation qui met à jour aussi la valeur du calendrier
  const handleNavigate = (action: 'prev' | 'next') => {
    navigate(action);
    // La valeur du calendrier sera mise à jour via useEffect lorsque currentDate changera
  };
  
  // Fonction pour gérer le changement de date depuis le header
  const handleHeaderDateChange = (newDate: Date) => {
    handleDateChange(newDate);
    setCalendarValue(newDate); // Mettre à jour la valeur affichée dans le calendrier
  };
  
  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setIsEditModalOpen(true);
  };
  
  // Échéances pour la période sélectionnée
  const selectedPeriodDeadlines = useMemo(() => {
    return viewMode === 'daily' 
      ? filterDeadlinesForDate(deadlines, currentDate)
      : filterDeadlinesForDateRange(deadlines, selectedRange);
  }, [deadlines, currentDate, selectedRange, viewMode]);

  // Forcer le calendrier à se rafraîchir en utilisant une clé qui change
  const calendarKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${viewMode}`;

  return (
    <div className={className}>
      {/* Calendrier */}
      <Card className="mb-6">
        <CalendarHeader
          viewMode={viewMode}
          currentDate={currentDate}
          selectedRange={selectedRange}
          onViewModeChange={setViewMode}
          onNavigate={navigate}
          onDateChange={(date) => handleDateChange(date)}
        />
        
        <CalendarGrid
          key={calendarKey} // Utilisez cette clé pour forcer le remontage du composant
          value={currentDate}
          view={calendarView}
          viewMode={viewMode}
          selectedRange={selectedRange}
          deadlines={deadlines}
          onChange={handleDateChange}
          onClickDay={handleClickDay}
          onClickMonth={handleClickMonth}
        />
      </Card>

      {/* Liste des échéances */}
      <Card>
        <DeadlinesList
          deadlines={selectedPeriodDeadlines}
          viewMode={viewMode}
          currentDate={currentDate}
          selectedRange={selectedRange}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenEditModal={openEditModal}
        />
      </Card>

      {/* Modals */}
      <AddDeadlineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
        initialDate={currentDate}
      />
      
      <EditDeadlineModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={refetch}
        deadline={selectedDeadline}
      />
    </div>
  );
};

export default CalendarView;