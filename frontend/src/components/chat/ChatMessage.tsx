/**
 * Composant ChatMessage
 * Affiche un message individuel dans l'interface de chat
 * @module components/chat/ChatMessage
 */
import { forwardRef } from 'react';

/**
 * Interface pour un message de chat
 */
export interface Message {
  /** Contenu du message */
  content: string;
  
  /** Origine du message (utilisateur ou IA) */
  sender: 'user' | 'ai';
  
  /** Horodatage du message */
  timestamp: Date;
}

/**
 * Props pour le composant ChatMessage
 */
interface ChatMessageProps {
  /** Message à afficher */
  message: Message;
}

/**
 * Composant pour afficher un message individuel dans l'interface de chat
 * @param {Object} props - Propriétés du composant
 * @param {Message} props.message - Message à afficher
 * @param {React.Ref<HTMLDivElement>} ref - Référence React
 * @returns {JSX.Element} Message de chat formaté
 */
export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message }, ref) => {
    const isUser = message.sender === 'user';
    
    return (
      <div
        ref={ref}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="text-sm">{message.content}</div>
          <div
            className={`text-xs mt-1 ${
              isUser ? 'text-blue-200' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    );
  }
);

// Ajout du displayName manquant
ChatMessage.displayName = 'ChatMessage';