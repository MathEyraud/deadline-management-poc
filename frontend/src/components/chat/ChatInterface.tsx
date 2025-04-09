/**
 * Composant ChatInterface
 * Interface de chat pour interagir avec l'agent IA
 * @module components/chat/ChatInterface
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Card, CardContent, Textarea, Button } from '@/components/ui';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { formatDateTime } from '@/lib/utils';

/**
 * Props pour le composant ChatInterface
 */
interface ChatInterfaceProps {
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant ChatMessage - Affiche un message unique dans la conversation
 * @param message - Le message à afficher
 * @returns Composant pour un message de chat
 */
const ChatMessageItem = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-3/4 rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-100 text-slate-800'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div 
          className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-slate-500'
          }`}
        >
          {formatDateTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

/**
 * Composant ChatInterface - Interface complète de chat avec l'IA
 * @param props - Propriétés du composant
 * @returns Composant ChatInterface
 */
export const ChatInterface = ({ className = '' }: ChatInterfaceProps) => {
  const { messages, sendMessage, clearMessages, isLoading } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exemples de requêtes pour aider l'utilisateur
  const exampleQueries = [
    "Quelles sont mes échéances à venir cette semaine ?",
    "Aide-moi à prioriser mes tâches",
    "Crée un résumé de mon projet principal",
    "Rappelle-moi les étapes pour compléter l'échéance"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  // Handle example query click
  const handleExampleClick = (query: string) => {
    sendMessage(query);
  };

  return (
    <Card className={`flex flex-col h-[calc(100vh-12rem)] ${className}`}>
      <CardContent className="flex flex-col h-full p-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Assistant IA</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-slate-500"
              title="Effacer la conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-slate-400 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">Comment puis-je vous aider ?</h3>
              <p className="text-slate-500 mb-6">Posez une question ou demandez de l'aide concernant vos échéances.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {exampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(query)}
                    className="text-left p-3 text-sm border border-slate-200 rounded hover:bg-slate-50 transition"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
            </>
          )}
          {/* Empty div for scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || !inputValue.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2">
            Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;