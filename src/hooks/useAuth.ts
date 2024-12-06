import { useState } from 'react';
import { ILoginCredentials, IRegisterCredentials, IAuthResponse, IAuthError, IUser } from '../types';
import { AuthService } from '../services/auth.service';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<IAuthError | null>(null);

    const login = async (credentials: ILoginCredentials): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthService.login(credentials);
            
            if (response.success && response.data) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return true;
            } else {
                setError({ 
                    message: response.message || 'Login failed',
                    field: 'email'
                });
                return false;
            }
        } catch (err) {
            setError({ 
                message: 'An error occurred during login',
                field: 'email'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (credentials: IRegisterCredentials): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthService.register(credentials);
            
            if (response.success) {
                return true;
            } else {
                setError({ 
                    message: response.message || 'Registration failed',
                    field: 'email'
                });
                return false;
            }
        } catch (err) {
            setError({ 
                message: 'An error occurred during registration',
                field: 'email'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        AuthService.logout();
    };

    const getCurrentUser = (): IUser | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    return {
        login,
        register,
        logout,
        getCurrentUser,
        loading,
        error
    };
};