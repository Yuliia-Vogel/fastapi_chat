import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';


export function ChatPage() {
    const { logout, user } = useAuth();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarClass = isMobileView && selectedUser ? 'hidden-mobile' : '';
    const mainContentClass = isMobileView && !selectedUser ? 'hidden-mobile' : '';

    return (
        <div className="chat-page-container">
            <aside className={`sidebar ${sidebarClass}`}>
                <header style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid #e5e7eb', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>
                        Чати ({user?.username})
                    </h2>
                    <button
                        onClick={logout}
                        style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.875rem' }}
                    >
                        Вийти
                    </button>
                </header>

                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                   <UserList onSelectUser={setSelectedUser} selectedUserId={selectedUser?.id || null} />
                </div>
            </aside>

            <main className={`main-content ${mainContentClass}`}>
                {selectedUser ? (
                    <ChatWindow selectedUser={selectedUser} onBack={() => setSelectedUser(null)} />
                ) : (
                    <div style={{ 
                        display: isMobileView ? 'none' : 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%'
                    }}>
                        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                            Оберіть чат, щоб почати спілкування
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}