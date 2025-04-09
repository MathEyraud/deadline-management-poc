/**
 * Page de chat avec l'agent IA
 * Affiche l'interface de conversation avec l'IA
 * Située sous le namespace dashboard pour maintenir la cohérence de navigation
 * @module app/dashboard/chat/page
 */
'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import ChatInterface from '@/components/chat/ChatInterface';

/**
 * Page Chat
 * Interface de conversation avec l'assistant IA
 * @returns Page Chat
 */
export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Chat IA"
        description="Posez des questions et obtenez de l'aide concernant vos échéances"
      />
      
      <ChatInterface className="h-[calc(100vh-13rem)]" />
    </>
  );
}