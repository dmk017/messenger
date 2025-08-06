import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { User } from '../types';


const AuthContext = createContext<{
    user: User | null;
    login: (username: string, email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}>({
    user: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    isAuthenticated: false,
});


export const AuthProvider = ({ children }: {children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (username: string, email: string, password: string) => {
        const { access_token, user } = await apiLogin(username, email, password);
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
    };

    const register = async (username: string, email: string, password: string) => {
        await apiRegister(username, email, password);
        await login(username, email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
