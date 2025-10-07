import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';

export function ChatPage() {
    const { logout, user } = useAuth();
    // Створюємо стан, щоб зберігати, якого користувача ми обрали для чату
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        // Головний контейнер на весь екран
        <div className="flex h-screen bg-gray-100 font-sans">
            
            {/* Ліва колонка (сайдбар) */}
            <aside className="w-1/3 bg-gray-200 border-r border-gray-300 flex flex-col">
                {/* Заголовок сайдбару */}
                <header className="p-4 border-b border-gray-300 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Чати ({user?.username})</h2>
                    <button
                        onClick={logout}
                        className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Вийти
                    </button>
                </header>
                {/* Список користувачів, який займає решту місця */}
                <div className="flex-grow overflow-y-auto">
                   <UserList onSelectUser={setSelectedUser} selectedUserId={selectedUser?.id || null} />
                </div>
            </aside>

            {/* Права колонка (головний контент) */}
            <main className="w-2/3 flex flex-col">
                {/* Перевіряємо, чи обрано користувача */}
                {selectedUser ? (
                    // Якщо так, показуємо вікно чату
                    <ChatWindow selectedUser={selectedUser} />
                ) : (
                    // Якщо ні, показуємо заглушку
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">Оберіть чат, щоб почати спілкування</p>
                    </div>
                )}
            </main>
        </div>
    );
}