import { useEffect, useState } from 'react';
import { User } from '../types';
import { getAllUsers } from '../services/apiService';
import { useAuth } from '../context/AuthContext';


interface UserListProps {
    onSelectUser: (user: User) => void;
}

export function UserList({ onSelectUser }: UserListProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user: currentUser } = useAuth();


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                // Фільтруємо, щоб не показувати себе у списку чатів
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

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <ul className="overflow-y-auto">
            {users.map((user) => (
                <li
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className="p-4 border-b border-gray-300 hover:bg-gray-300 cursor-pointer"
                >
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </li>
            ))}
        </ul>
    );
}