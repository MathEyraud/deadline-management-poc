/**
 * Page de chat avec l'agent IA
 * Affiche l'interface de conversation avec l'IA
 * @module app/chat/page
 */
'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ChatInterface from '@/components/chat/ChatInterface';

/**
 * Page Chat
 * Interface de conversation avec l'assistant IA
 * @returns Page Chat
 */
export default function ChatPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Chat IA"
        description="Posez des questions et obtenez de l'aide concernant vos échéances"
      />
      
      <ChatInterface className="h-[calc(100vh-13rem)]" />
    </DashboardLayout>
  );
}