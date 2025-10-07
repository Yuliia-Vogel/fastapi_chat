
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { ChatPage } from './pages/ChatPage';

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route path="/" element={<Navigate to="/chat" />} />

                <Route element={<ProtectedRoute />}>
                    {/* <ChatPage /> */}
                    <Route path="/chat" element={<ChatPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;