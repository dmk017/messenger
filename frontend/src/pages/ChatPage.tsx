import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../components/Chat/ChatWindow';
import { useAuth } from '../context/AuthContext';

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!chatId) {
    return <div>Чат не найден</div>;
  }

  if (chatId === 'new') {
    navigate('/chat/new');
    return null;
  }

  const chatIdNum = parseInt(chatId, 10);
  
  if (isNaN(chatIdNum)) {
    return <div>Некорректный идентификатор чата</div>;
  }

  return (
    <div className="container py-6 h-full flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/chats')}
          className="btn btn-secondary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          К чатам
        </button>
        
        <h2 className="text-xl font-bold">Чат #{chatId}</h2>
        
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 mr-2" />
          <span className="font-medium">{user?.username}</span>
        </div>
      </header>
      
      <div className="card flex-grow flex flex-col overflow-hidden">
        <ChatWindow chatId={chatIdNum} />
      </div>
    </div>
  );
};

export default ChatPage;