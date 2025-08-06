import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createChat } from "../api/chat";

const NewChatPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [userIdsInput, setUserIdsInput] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const userIds = userIdsInput.split(',').map(id => id.trim());
            if (userIds.length === 0) {
                throw new Error('Добавьте хотя бы одного участника');
            }
            
            const chat = await createChat(userIds, isGroup, title);
            
            setSuccess(true);
            
            setTimeout(() => {
                navigate(`/chat/${chat.id}`);
            }, 1500);
        } catch (err) {
            setError('Ошибка создания чата');
            console.error(err);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card text-center max-w-md w-full">
                    <div className="mx-auto bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Чат успешно создан!</h1>
                    <p className="text-gray-600">Перенаправляем на страницу чатов...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <button 
                onClick={() => navigate('/chats')}
                className="btn btn-secondary flex items-center mb-6"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Назад
            </button>
            
            <div className="card p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Создать новый чат</h1>
                
                {error && <div className="error-message mb-6">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isGroup}
                                    onChange={(e) => setIsGroup(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`block w-14 h-8 rounded-full ${isGroup ? 'bg-primary-color' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isGroup ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                            <span className="ml-3 text-gray-700 font-medium">Групповой чат</span>
                        </label>
                    </div>
                    
                    {isGroup && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Название группы
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required={isGroup}
                                className="input-field"
                                placeholder="Введите название чата"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID участников (через запятую)
                        </label>
                        <input
                            type="text"
                            value={userIdsInput}
                            onChange={(e) => setUserIdsInput(e.target.value)}
                            required
                            className="input-field"
                            placeholder="user1, user2, user3"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Введите ID пользователей через запятую
                        </p>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button 
                            type="submit" 
                            className="btn btn-primary flex-1"
                        >
                            Создать чат
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/chats')}
                            className="btn btn-secondary flex-1"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewChatPage;