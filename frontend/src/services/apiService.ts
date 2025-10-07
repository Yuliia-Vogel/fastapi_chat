import axios from 'axios';
import { User, Message } from '../types';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Функція-перехоплювач для додавання токена до кожного запиту
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const getAllUsers = (): Promise<{ data: User[] }> => {
    return apiClient.get('/users');
};

// Функція для отримання історії повідомлень з конкретним користувачем
export const getMessagesWithUser = (userId: number): Promise<{ data: Message[] }> => {
    return apiClient.get(`/messages/${userId}`);
};

// Функції для редагування та видалення. Ми їх поки не реалізуємо, але залишимо на майбутнє
export const deleteMessage = (messageId: number) => {
    return apiClient.delete(`/messages/${messageId}`);
};

export const updateMessage = (messageId: number, content: string) => {
    return apiClient.put(`/messages/${messageId}`, { content });
};