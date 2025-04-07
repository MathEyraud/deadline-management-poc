import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { PageHeader } from '@/components/layout/PageHeader';
// import { DeadlineFilter } from '@/components/deadline/DeadlineFilter';

/**
 * Page affichant les échéances sous forme de calendrier
 * @returns {JSX.Element} Page calendrier des échéances
 */
export default function Calendar() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <PageHeader 
          title="Calendrier des échéances" 
          description="Visualisez vos échéances dans une vue calendrier" 
        />
        
        {/* Filtres */}
        {/* <DeadlineFilter /> */}
        
        {/* Vue calendrier */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <Suspense fallback={<div>Chargement du calendrier...</div>}>
            <CalendarView />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
