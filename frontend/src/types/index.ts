export interface User {
    id: string;
    username: string;
    email: string;
    created_at: string;
}

export interface Chat {
    id: number;
    title?: string;
    is_group: boolean;
    member_ids: string[];
}

export interface Message {
    id: number;
    content: string;
    created_at: string;
    sender_id: string;
    chat_id: number;
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}
