import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { PageHeader } from '@/components/layout/PageHeader';

/**
 * Page d'interface de chat avec l'agent IA
 * @returns {JSX.Element} Page interface de chat IA
 */
export default function Chat() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <PageHeader 
          title="Assistant IA" 
          description="Posez vos questions et recevez de l'aide sur vos échéances" 
        />
        
        <div className="bg-white rounded-lg shadow h-[calc(100vh-220px)] flex flex-col">
          <ChatInterface />
        </div>
      </div>
    </DashboardLayout>
  );
}
