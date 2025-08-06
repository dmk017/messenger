import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChats } from '../api/chat';
import { Chat } from '../types';

const ChatListPage = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const chatsData = await getChats();
                setChats(chatsData);
            } catch (error) {
                console.error('Ошибка загрузки чатов:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-primary-color mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-500">Загрузка чатов...</p>
            </div>
        </div>
    );

    return (
        <div className="container py-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Мессенджер</h1>
                    <p className="text-gray-500">Привет, {user?.username}!</p>
                </div>
                <button 
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="btn btn-secondary flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Выйти
                </button>
            </header>

            <div className="card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Ваши чаты</h2>
                    <button 
                        onClick={() => navigate('/chat/new')}
                        className="btn btn-primary flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Новый чат
                    </button>
                </div>
                
                {chats.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">Чатов пока нет</h3>
                        <p className="text-gray-500 mb-4">Создайте новый чат, чтобы начать общение</p>
                        <button 
                            onClick={() => navigate('/chat/new')}
                            className="btn btn-primary"
                        >
                            Создать чат
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chats.map(chat => (
                            <div 
                                key={chat.id}
                                onClick={() => navigate(`/chat/${chat.id}`)}
                                className="border border-medium-gray rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                                    <div>
                                        <h3 className="font-medium">{chat.title || `Чат ${chat.id}`}</h3>
                                        <p className="text-sm text-gray-500">
                                            {chat.member_ids.length} участников
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Последнее сообщение: сегодня</span>
                                    <span className="bg-primary-color text-white rounded-full px-2 py-1 text-xs">
                                        2
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatListPage;