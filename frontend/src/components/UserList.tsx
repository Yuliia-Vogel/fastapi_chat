import { useEffect, useState } from 'react';
import { User } from '../types';
import { getAllUsers } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

interface UserListProps {
    onSelectUser: (user: User) => void;
    selectedUserId: number | null;
}

export function UserList({ onSelectUser, selectedUserId }: UserListProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setUsers(response.data.filter(u => u.id !== currentUser?.id));
            } catch (err) {
                setError("Не вдалося завантажити користувачів.");
                console.error(err);
            }
        };
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (users.length === 0) return <div className="p-4 text-gray-500">Інших користувачів не знайдено.</div>;

    return (
        <ul className="p-2 flex flex-col gap-2">
            {users.map((user) => {
                const isSelected = selectedUserId === user.id;
                
                return (
                    <li
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className={`p-3 flex items-center gap-4 cursor-pointer rounded-lg border shadow-sm transition-all duration-200 ${
                            isSelected 
                                ? 'border-purple-500 bg-purple-50 shadow-md' 
                                : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-green-200 text-green-800 flex items-center justify-center font-bold text-xl flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-grow">
                            <p className={`font-semibold ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                                {user.username}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}