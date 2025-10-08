// як виглядає користувач, що приходить з беку:
export interface User {
    id: number;
    email: string;
    username: string;
}

// опис одного вкладення
export interface Attachment {
    id: number;
    original_filename: string;
    file_path: string;
    file_type: string;
}

// дані для форми реєстрації:
export interface RegisterData {
    email: string;
    username: string;
    password: string;
}

// дані для форми логіну:
export interface LoginData {
    email: string;
    password: string;
}

// вигляд повідомлення:
export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    message_date: string; // Дати з беку приходять як рядки
    attachments: Attachment[]; // масив вкладень
}