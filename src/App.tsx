import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
    const { getCurrentUser } = useAuth();
    const user = getCurrentUser();

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route>
                    <Route 
                        path="/login" 
                        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
                    />
                    <Route 
                        path="/register" 
                        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
                    />
                </Route>

                {/* Protected Routes */}
                {/* <Route path="/dashboard" element={
                    <ProtectedRoute>
                        
                    </ProtectedRoute>
                } /> */}

                {/* Redirect root to appropriate page */}
                <Route 
                    path="/" 
                    element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
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