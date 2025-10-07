
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Message, User } from '../types/index.ts';
import { getMe } from '../services/authService'; 

interface AuthContextType {
    token: string | null;
    user: User | null; 
    isAuthenticated: boolean;
    login: (newToken: string) => void;
    logout: () => void;
    sendMessage: (content: string, receiver_id: number) => void;
    lastMessage: Message | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null); // Стан для даних користувача
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    useEffect(() => {
        const fetchUserAndConnectWs = async (currentToken: string) => {
            try {
                // 1. Отримуємо дані користувача
                const userResponse = await getMe(currentToken);
                setUser(userResponse.data);

                // 2. Встановлюємо WebSocket з'єднання
                const newWs = new WebSocket(`ws://localhost:8000/ws?token=${currentToken}`);
                newWs.onopen = () => console.log("WebSocket Connected");
                newWs.onmessage = (event) => setLastMessage(JSON.parse(event.data));
                newWs.onclose = () => console.log("WebSocket Disconnected");
                setWs(newWs);

            } catch (error) {
                console.error("Failed to fetch user or connect WebSocket", error);
                logout(); // Якщо токен невалідний, виходимо
            }
        };
        
        if (token) {
            localStorage.setItem('token', token);
            fetchUserAndConnectWs(token);
        } else {
            localStorage.removeItem('token');
            setUser(null);
            if (ws) {
                ws.close();
                setWs(null);
            }
        }

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
    };
    
    const sendMessage = (content: string, receiver_id: number) => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ content, receiver_id }));
        }
    };
    
    const isAuthenticated = !!token;

    const value = { token, user, isAuthenticated, login, logout, sendMessage, lastMessage };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}