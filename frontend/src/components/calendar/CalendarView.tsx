import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Button } from '../ui/Button';

/**
 * Vue calendrier des échéances
 * @returns {JSX.Element} Composant de vue calendrier
 */
/**
 * Composant d'affichage des échéances en mode calendrier
 * Permet de visualiser les échéances par mois et de consulter les détails par jour
 * @returns {JSX.Element} Composant de calendrier interactif
 */
export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { data: deadlines } = useDeadlines({});
  
  /**
   * Passe au mois précédent
   */
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  /**
   * Passe au mois suivant
   */
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  /**
   * Sélectionne une date pour afficher ses échéances
   * @param {Date} date - Date à sélectionner
   */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Obtenir tous les jours du mois courant
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Déterminer le premier jour de la semaine (0 = dimanche, 1 = lundi, etc.)
  const startDay = getDay(monthStart);
  
  // Obtenir les échéances du jour sélectionné
  const selectedDateDeadlines = selectedDate && deadlines 
    ? deadlines.filter(deadline => {
        const deadlineDate = new Date(deadline.deadlineDate);
        return deadlineDate.getDate() === selectedDate.getDate() &&
               deadlineDate.getMonth() === selectedDate.getMonth() &&
               deadlineDate.getFullYear() === selectedDate.getFullYear();
      })
    : [];
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex space-x-2">
          <Button size="sm" onClick={handlePreviousMonth}>
            Précédent
          </Button>
          <Button size="sm" onClick={() => setCurrentDate(new Date())}>
            Aujourd'hui
          </Button>
          <Button size="sm" onClick={handleNextMonth}>
            Suivant
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Entêtes des jours de la semaine */}
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
          <div key={day} className="font-semibold text-center py-2">
            {day}
          </div>
        ))}
        
        {/* Cases vides pour le début du mois */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-${index}`} className="h-32 bg-gray-50 border border-gray-200 rounded-md" />
        ))}
        
        {/* Jours du mois */}
        {daysInMonth.map(day => {
          // Filtrer les échéances pour ce jour
          const dayDeadlines = deadlines ? deadlines.filter(deadline => {
            const deadlineDate = new Date(deadline.deadlineDate);
            return deadlineDate.getDate() === day.getDate() &&
                   deadlineDate.getMonth() === day.getMonth() &&
                   deadlineDate.getFullYear() === day.getFullYear();
          }) : [];
          
          return (
            <div
              key={day.toString()}
              className={`h-32 p-1 border rounded-md overflow-hidden transition-colors cursor-pointer
                ${isToday(day) ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                ${selectedDate && day.getDate() === selectedDate.getDate() && 
                  day.getMonth() === selectedDate.getMonth() ? 
                  'ring-2 ring-blue-500' : ''}
                ${!isSameMonth(day, currentDate) ? 'text-gray-400' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="mt-1 space-y-1 overflow-hidden">
                {dayDeadlines.slice(0, 3).map(deadline => (
                  <div 
                    key={deadline.id} 
                    className={`text-xs px-1 py-0.5 rounded truncate
                      ${deadline.priority === 'haute' ? 'bg-red-100 text-red-800' : 
                        deadline.priority === 'moyenne' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}
                  >
                    {deadline.title}
                  </div>
                ))}
                {dayDeadlines.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayDeadlines.length - 3} de plus
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Détails de la date sélectionnée */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </h3>
          
          {selectedDateDeadlines.length === 0 ? (
            <p className="text-gray-500">Aucune échéance pour cette date</p>
          ) : (
            <div className="space-y-2">
              {selectedDateDeadlines.map(deadline => (
                <div key={deadline.id} className="p-2 bg-white rounded shadow-sm">
                  <div className="font-medium">{deadline.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{deadline.description}</div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full
                      ${deadline.priority === 'haute' ? 'bg-red-100 text-red-800' : 
                        deadline.priority === 'moyenne' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}
                    >
                      {deadline.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {deadline.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
