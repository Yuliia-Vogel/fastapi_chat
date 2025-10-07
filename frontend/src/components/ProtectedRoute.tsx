import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Якщо користувач не залогінений, перенаправляємо його на сторінку входу
        return <Navigate to="/login" replace />;
    }

    // Якщо залогінений, показуємо дочірній маршрут (наприклад, сторінку чату)
    return <Outlet />;
}