import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Створимо тимчасову сторінку-заглушку, щоб було що показувати після логіну
function ChatPage() {
    const { logout } = useAuth();
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-green-600">Ви успішно увійшли!</h1>
            <p className="mt-2 text-gray-700">Сторінка чату буде тут.</p>
            <button
                onClick={logout}
                className="mt-8 px-6 py-2 text-lg font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600"
            >
                Вийти
            </button>
        </div>
    );
}


function App() {
  return (
    // 1. Наш AuthProvider "обгортає" весь додаток, надаючи доступ до даних автентифікації
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                {/* 2. Публічні маршрути, доступні всім */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* 3. Коли користувач заходить на "/", його перекидає на "/chat" */}
                <Route path="/" element={<Navigate to="/chat" />} />

                {/* 4. Захищена зона. Все, що всередині, буде доступно тільки авторизованим користувачам */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/chat" element={<ChatPage />} />
                    {/* Можна додати інші захищені маршрути тут, наприклад /profile */}
                </Route>
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;