import { useEffect, useState, useRef } from 'react';
import { User, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { getMessagesWithUser, deleteMessage, updateMessage, sendMessageWithFiles } from '../services/apiService';

// Компонент-форма для редагування
function EditMessageForm({ message, onSave, onCancel }: { message: Message, onSave: (newContent: string) => void, onCancel: () => void }) {
    const [content, setContent] = useState(message.content);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (content.trim()) { onSave(content.trim()); } };
    return ( <form onSubmit={handleSubmit} className="flex"> <input type="text" value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 px-2 py-1 text-sm border border-gray-400 rounded-l-md bg-white text-black" autoFocus /> <button type="submit" className="px-3 py-1 text-sm bg-green-600 text-white rounded-r-md">Зберегти</button> <button type="button" onClick={onCancel} className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md ml-2">Скасувати</button> </form> );
}


export function ChatWindow({ selectedUser }: ChatWindowProps) {
    const { user: currentUser, sendMessage, lastMessage } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ВІДНОВЛЕНО: функція прокрутки
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // ВІДНОВЛЕНО: useEffect для завантаження історії повідомлень
    useEffect(() => {
        if (selectedUser) {
            setEditingMessage(null);
            getMessagesWithUser(selectedUser.id)
                .then(response => setMessages(response.data))
                .catch(err => console.error("Failed to fetch messages", err));
        }
    }, [selectedUser]);

    // ВІДНОВЛЕНО: useEffect для отримання нових повідомлень через WebSocket
    useEffect(() => {
        if (lastMessage && currentUser && ((lastMessage.sender_id === selectedUser.id && lastMessage.receiver_id === currentUser.id) || (lastMessage.sender_id === currentUser.id && lastMessage.receiver_id === selectedUser.id))) {
            setMessages(prev => prev.find(m => m.id === lastMessage.id) ? prev : [...prev, lastMessage]);
        }
    }, [lastMessage, selectedUser, currentUser]);

    // ВІДНОВЛЕНО: useEffect для автопрокрутки
    useEffect(scrollToBottom, [messages]);
    
    // ВІДНОВЛЕНО: функція видалення
    const handleDelete = async (messageId: number) => {
        if (window.confirm("Ви впевнені, що хочете видалити це повідомлення?")) {
            try {
                await deleteMessage(messageId);
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
            } catch (error) {
                console.error("Failed to delete message", error);
                alert("Не вдалося видалити повідомлення.");
            }
        }
    };
    
    // ВІДНОВЛЕНО: функція оновлення
    const handleUpdate = async (newContent: string) => {
        if (!editingMessage) return;
        try {
            const updated = await updateMessage(editingMessage.id, newContent);
            setMessages(prev => prev.map(msg => msg.id === editingMessage.id ? updated.data : msg));
            setEditingMessage(null);
        } catch (error) {
            console.error("Failed to update message", error);
            alert("Не вдалося оновити повідомлення.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) { setSelectedFiles(e.target.files); }
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFiles) || !selectedUser) return;

        if (selectedFiles && selectedFiles.length > 0) {
            try {
                await sendMessageWithFiles(newMessage, selectedUser.id, selectedFiles);
            } catch (error) { console.error("Failed to send message with files", error); alert("Не вдалося відправити файли."); }
        } else {
            sendMessage(newMessage, selectedUser.id);
        }

        setNewMessage('');
        setSelectedFiles(null);
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
    };

    if (!currentUser) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-white border-b border-gray-300"><h2 className="text-xl font-bold">{selectedUser.username}</h2></div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messages.map((msg) => {
                    const isMyMessage = msg.sender_id === currentUser.id;
                    const isEditing = editingMessage?.id === msg.id;

                    return (
                        <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`group flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                                <div className={`relative max-w-md p-3 rounded-lg shadow ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                                    {isEditing ? ( <EditMessageForm message={msg} onSave={handleUpdate} onCancel={() => setEditingMessage(null)} /> ) : (
                                        <>
                                            {msg.content && <p>{msg.content}</p>}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className={`mt-2 flex flex-col gap-1 ${msg.content ? 'border-t border-blue-300 pt-2' : ''}`}>
                                                    {msg.attachments.map(att => (
                                                        <a href={`${import.meta.env.VITE_API_BASE_URL}/${att.file_path}`} target="_blank" rel="noopener noreferrer" key={att.id} className="text-sm font-medium hover:underline text-inherit">
                                                            📄 {att.original_filename}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                {isMyMessage && !isEditing && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingMessage(msg)} className="text-xs text-gray-500 hover:text-blue-700">✏️</button>
                                        <button onClick={() => handleDelete(msg.id)} className="text-xs text-gray-500 hover:text-red-700">🗑️</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-300">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-xl rounded-full hover:bg-gray-200">📎</button>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Напишіть повідомлення..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Надіслати</button>
                </form>
                 {selectedFiles && selectedFiles.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1 pl-12">
                        **Прикріплено:** {Array.from(selectedFiles).map(file => file.name).join(', ')}
                        <button onClick={() => { setSelectedFiles(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="ml-2 text-red-500 font-bold">X</button>
                    </div>
                )}
            </div>
        </div>
    );
}