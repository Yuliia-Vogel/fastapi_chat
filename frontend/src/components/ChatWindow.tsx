import { useEffect, useState, useRef } from 'react';
import { User, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { getMessagesWithUser, deleteMessage, updateMessage } from '../services/apiService';

// Компонент-форма для редагування залишається без змін
function EditMessageForm({ message, onSave, onCancel }: { message: Message, onSave: (newContent: string) => void, onCancel: () => void }) {
    const [content, setContent] = useState(message.content);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (content.trim()) { onSave(content.trim()); } };
    return (
        <form onSubmit={handleSubmit} className="flex">
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} className="flex-1 px-2 py-1 text-sm border border-gray-400 rounded-l-md bg-white text-black" autoFocus />
            <button type="submit" className="px-3 py-1 text-sm bg-green-600 text-white rounded-r-md">Зберегти</button>
            <button type="button" onClick={onCancel} className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md ml-2">Скасувати</button>
        </form>
    );
}


export function ChatWindow({ selectedUser }: ChatWindowProps) {
    const { user: currentUser, sendMessage, lastMessage } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    useEffect(() => {
        if (selectedUser) {
            setEditingMessage(null);
            getMessagesWithUser(selectedUser.id).then(response => setMessages(response.data)).catch(err => console.error("Failed to fetch messages", err));
        }
    }, [selectedUser]);

    useEffect(() => {
        if (lastMessage && currentUser && ((lastMessage.sender_id === selectedUser.id && lastMessage.receiver_id === currentUser.id) || (lastMessage.sender_id === currentUser.id && lastMessage.receiver_id === selectedUser.id))) {
            setMessages(prev => prev.find(m => m.id === lastMessage.id) ? prev : [...prev, lastMessage]);
        }
    }, [lastMessage, selectedUser, currentUser]);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => { e.preventDefault(); if (newMessage.trim() && selectedUser) { sendMessage(newMessage, selectedUser.id); setNewMessage(''); } };
    const handleDelete = async (messageId: number) => { if (window.confirm("Ви впевнені?")) { try { await deleteMessage(messageId); setMessages(prev => prev.filter(msg => msg.id !== messageId)); } catch (error) { console.error("Failed to delete message", error); alert("Не вдалося видалити."); } } };
    const handleUpdate = async (newContent: string) => { if (!editingMessage) return; try { const updated = await updateMessage(editingMessage.id, newContent); setMessages(prev => prev.map(msg => msg.id === editingMessage.id ? updated.data : msg)); setEditingMessage(null); } catch (error) { console.error("Failed to update message", error); alert("Не вдалося оновити."); } };

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
                            {/* ---> ПРАВИЛЬНО: 'group' має бути на спільному батьківському елементі <--- */}
                            <div className={`group flex items-end gap-2 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                                <div className={`relative max-w-md p-3 rounded-lg shadow ${isMyMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
                                    {isEditing ? (
                                        <EditMessageForm message={msg} onSave={handleUpdate} onCancel={() => setEditingMessage(null)} />
                                    ) : (
                                        <p>{msg.content}</p>
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
                <form onSubmit={handleSendMessage} className="flex">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Напишіть повідомлення..." className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-r-lg hover:bg-blue-600 transition-colors">Надіслати</button>
                </form>
            </div>
        </div>
    );
}