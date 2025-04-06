'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarView } from '@/components/calendar/CalendarView';

/**
 * Page affichant les échéances sous forme de calendrier
 * @returns {JSX.Element} Page calendrier des échéances
 */
export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Calendrier" 
        description="Visualisez vos échéances dans une vue calendrier" 
      />
      
      <div className="bg-white rounded-lg shadow p-4">
        <CalendarView />
      </div>
    </div>
  );
}
