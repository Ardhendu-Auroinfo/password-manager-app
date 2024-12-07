import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VaultPage from './pages/vault/VaultPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route 
                    path="/login" 
                    element={user ? <Navigate to="/vault" replace /> : <LoginPage />} 
                />
                <Route 
                    path="/register" 
                    element={user ? <Navigate to="/vault" replace /> : <RegisterPage />} 
                />

                {/* Protected Routes */}
                <Route path="/vault" element={
                    <ProtectedRoute>
                        <VaultPage />
                    </ProtectedRoute>
                } />

                {/* Redirect root to appropriate page */}
                <Route 
                    path="/" 
                    element={<Navigate to={user ? "/vault" : "/login"} replace />} 
                />

                {/* 404 Page - Optional */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900">404</h1>
                            <p className="text-gray-600">Page not found</p>
                        </div>
                    </div>
                } />
            </Routes>
        </Router>
    );
};

export default App;