import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VaultPage from './pages/vault/VaultPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { VaultProvider } from './contexts/VaultContext';
import { useAppSelector } from './hooks/useRedux';
import { Toaster } from 'react-hot-toast';
import FavoritePage from './pages/vault/FavoritePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RecoveryPage from './pages/auth/RecoveryPage';
import SharingCenterPage from './pages/vault/SharingCenterPage';

// Separate component for routes that uses Redux hooks
const AppRoutes: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <VaultProvider>
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

                <Route path="/favorites" element={
                    <ProtectedRoute>
                        <FavoritePage />
                    </ProtectedRoute>
                } />

                <Route path="/sharing-center" element={
                    <ProtectedRoute>
                        <SharingCenterPage />
                    </ProtectedRoute>
                } />

                {/* Redirect root to appropriate page */}
                <Route 
                    path="/" 
                    element={<Navigate to={user ? "/vault" : "/login"} replace />} 
                />

                {/* 404 Page */}
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900">404</h1>
                            <p className="text-gray-600">Page not found</p>
                        </div>
                    </div>
                } />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/account-recovery" element={<RecoveryPage />} />   
            </Routes>
        </VaultProvider>
    );
};

// Main App component that provides Redux store
const App: React.FC = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Router>
                    <AppRoutes />
                </Router>
            </PersistGate>
            <Toaster position="top-right" />
        </Provider>
    );
};

export default App;