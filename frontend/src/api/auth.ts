import api from './index';
import { User } from '../types';

export const login = async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/login', { username, email, password });
    return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<void> => {
    const response = await api.post('/auth/register', { 
        username, 
        email, 
        password 
    });
    return response.data;
};

export const getMe = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
};
