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
});

export const getAllUsers = (): Promise<{ data: User[] }> => {
    return apiClient.get('/users');
};

export const getMessagesWithUser = (userId: number): Promise<{ data: Message[] }> => {
    return apiClient.get(`/messages/${userId}`);
};

// Тут можна додати функції для редагування, видалення повідомлень, завантаження файлів
// export const deleteMessage = (messageId: number) => apiClient.delete(`/messages/${messageId}`);
// export const updateMessage = (messageId: number, content: string) => apiClient.put(`/messages/${messageId}`, { content });