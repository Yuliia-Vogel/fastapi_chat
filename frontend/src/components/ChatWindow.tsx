import { useEffect, useState, useRef } from 'react';
import { User, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { getMessagesWithUser } from '../services/apiService';

interface ChatWindowProps {
    selectedUser: User;
}

export function ChatWindow({ selectedUser }: ChatWindowProps) {
    const { user: currentUser, sendMessage, lastMessage } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Функція для прокрутки до останнього повідомлення
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Завантажуємо історію повідомлень при зміні обраного користувача
    useEffect(() => {
        if (selectedUser) {
            getMessagesWithUser(selectedUser.id)
                .then(response => {
                    setMessages(response.data);
                })
                .catch(err => console.error("Failed to fetch messages", err));
        }
    }, [selectedUser]);
    
    // 2. Додаємо нове повідомлення з WebSocket, якщо воно для поточного чату
    useEffect(() => {
        if (lastMessage && currentUser && (lastMessage.sender_id === selectedUser.id && lastMessage.receiver_id === currentUser.id || lastMessage.sender_id === currentUser.id && lastMessage.receiver_id === selectedUser.id)) {
            setMessages(prevMessages => [...prevMessages, lastMessage]);
        }
    }, [lastMessage, selectedUser, currentUser]);

    // 3. Прокручуємо вниз, коли додаються нові повідомлення
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedUser) {
            sendMessage(newMessage, selectedUser.id);
            setNewMessage('');
        }
    };
    
    if (!currentUser) return null;

    return (
        <>
            {/* Заголовок чату */}
            <div className="p-4 bg-white border-b border-gray-300">
                <h2 className="text-xl font-bold">{selectedUser.username}</h2>
            </div>
            
            {/* Повідомлення */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg) => {
                    const isMyMessage = msg.sender_id === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-md p-3 rounded-lg ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                                <p>{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMyMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {new Date(msg.message_date).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Форма вводу */}
            <div className="p-4 bg-white border-t border-gray-300">
                <form onSubmit={handleSendMessage} className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Напишіть повідомлення..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600">
                        Надіслати
                    </button>
                    {/* TODO: Додати кнопку для прикріплення файлів */}
                </form>
            </div>
        </>
    );
}