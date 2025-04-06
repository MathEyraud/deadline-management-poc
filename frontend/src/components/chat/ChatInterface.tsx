'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks';
import { useNotifications } from '@/app/providers';

/**
 * Composant d'interface de chat avec l'agent IA
 * @returns {JSX.Element} Interface de chat
 */
export const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isLoading, error, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useNotifications();
  
  // Suggestions de requêtes pour l'utilisateur
  const suggestions = [
    'Quelles sont mes échéances à venir cette semaine ?',
    'Liste mes projets actifs',
    'Combien d\'échéances sont en retard ?',
    'Crée un résumé de mes échéances par priorité'
  ];
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
    }
  }, [error, showNotification]);
  
  // Envoyer un message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      sendMessage(message);
      setMessage('');
    }
  };
  
  // Utiliser une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête du chat */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-lg font-medium">Assistant IA</h3>
          <p className="text-sm text-gray-500">Posez vos questions sur vos échéances</p>
        </div>
        <button
          onClick={clearMessages}
          className="text-sm text-gray-500 hover:text-gray-700"
          title="Effacer la conversation"
        >
          Effacer
        </button>
      </div>
      
      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">Comment puis-je vous aider aujourd'hui ?</h3>
            <p className="text-gray-500 mb-6">
              Je peux vous aider à gérer vos échéances, projets et plus encore.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-200 text-gray-800 mr-auto'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 mr-auto">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Zone de saisie */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
};