import api from './index';
import { Chat, Message } from '../types';


export const getChats = async (): Promise<Chat[]> => {
    const response = await api.get('/chats');
    return response.data;
}

export const createChat = async (userIds: string[], isGroup: boolean, title?: string): Promise<Chat> => {
    const response = await api.post('/chats', {
        user_ids: userIds,
        is_group: isGroup,
        title,
    });

    return response.data;
};

export const getMessages = async (chatId: number): Promise<Message[]> => {
    const response = await api.get(`/messages/chat/${chatId}`);
    return response.data;
}

export const sendMessage = async (chatId: number, content: string): Promise<Message> => {
    const response = await api.post('/messages', {
        chat_id: chatId,
        content,
    });
    return response.data;
}
