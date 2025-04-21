/**
 * Page principale du chat IA
 * Point d'entrée pour l'interface de chat avec l'IA
 * @module app/chat/page
 */
'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import ChatInterface from '@/components/chat/ChatInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * Page Chat
 * Interface principale de conversation avec l'assistant IA
 * @returns Page Chat
 */
export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <PageHeader
          title="Chat IA"
          description="Posez des questions et obtenez de l'aide concernant vos échéances"
          className="flex-shrink-0 pb-4"
        />
        
        <div className="flex-grow overflow-hidden">
          <ChatInterface height="100%" />
        </div>
      </div>
    </DashboardLayout>
  );
}