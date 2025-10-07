import axios from 'axios';
import { RegisterData, LoginData } from '../types/index.ts'; // Імпортуємо наші типи

console.log("API Base URL from env:", import.meta.env.VITE_API_BASE_URL);

// екземпляр axios - він буде робити запити на бекенд:
const apiClient = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL, 
    });

export const registerUser = (data: RegisterData) => {
    return apiClient.post('/auth/register', data);
};

export const loginUser = (data: LoginData) => {
    // логін на бекенді очікує спеціальний формат 'x-www-form-urlencoded'
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);
    
    return apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
};

export const getMe = (token: string) => {
    return apiClient.get('/users/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};