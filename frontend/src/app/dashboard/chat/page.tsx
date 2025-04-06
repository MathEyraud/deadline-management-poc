'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { ChatInterface } from '@/components/chat/ChatInterface';

/**
 * Page d'interface de chat avec l'agent IA
 * @returns {JSX.Element} Page interface de chat IA
 */
export default function ChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Assistant IA" 
        description="Posez vos questions et recevez de l'aide sur vos échéances" 
      />
      
      <div className="bg-white rounded-lg shadow h-[calc(100vh-220px)] flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}
