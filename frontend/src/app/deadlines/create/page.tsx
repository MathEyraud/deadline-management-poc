import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeadlineForm } from '@/components/deadline/DeadlineForm';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Page de création d'une nouvelle échéance
 * @returns {JSX.Element} Page formulaire de création d'échéance
 */
export default function CreateDeadline() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <PageHeader 
          title="Créer une échéance" 
          description="Ajoutez une nouvelle échéance au système" 
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <DeadlineForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
