
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';

export function ChatPage() {
    const { logout, user } = useAuth();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-1/3 bg-gray-200 border-r border-gray-300 flex flex-col">
                <header className="p-4 border-b border-gray-300 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Чати ({user?.username})</h2>
                    <button
                        onClick={logout}
                        className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600"
                    >
                        Вийти
                    </button>
                </header>
                <div className="flex-grow">
                   <UserList onSelectUser={setSelectedUser} selectedUserId={selectedUser?.id || null} />
                </div>
            </aside>

            <main className="w-2/3 flex flex-col">
                {selectedUser ? (
                    <ChatWindow selectedUser={selectedUser} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">Оберіть чат, щоб почати спілкування</p>
                    </div>
                )}
            </main>
        </div>
    );
}