import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '../../types';
import useWebSocket from '../../hooks/useWebSocket';
import { getMessages as apiGetMessages } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';

const MessageComponent: React.FC<{ message: Message, currentUserId: string }> = ({ message, currentUserId }) => {
  const isCurrentUser = message.sender_id === currentUserId;
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
        isCurrentUser 
          ? 'bg-primary-color text-white rounded-br-none' 
          : 'bg-white border border-medium-gray rounded-bl-none'
      }`}>
        <div className="text-sm font-medium mb-1">
          {isCurrentUser ? 'Вы' : message.sender_id || `Участник ${message.sender_id.slice(0, 6)}`}
        </div>
        <div className="text-base">{message.content}</div>
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

const ChatWindow: React.FC<{ chatId: number }> = ({ chatId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const { user } = useAuth();

    const handleNewMessage = useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const { sendMessage: wsSendMessage } = useWebSocket(chatId, handleNewMessage);

    useEffect(() => {
        if (!chatId) return;

        const loadMessages = async () => {
            try {
                const messagesData = await apiGetMessages(chatId);
                setMessages(messagesData);
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadMessages();
    }, [chatId]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            wsSendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-color mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-500">Загрузка сообщений...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4 pb-0">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-1">Нет сообщений</h3>
                            <p className="text-gray-500">Начните общение, отправив первое сообщение</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {messages.map(message => (
                            <MessageComponent 
                                key={message.id} 
                                message={message} 
                                currentUserId={user?.id || ''} 
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-medium-gray bg-white">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Напишите сообщение..."
                        className="input-field flex-grow"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="btn btn-primary px-4 flex-shrink-0"
                        disabled={!newMessage.trim()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;