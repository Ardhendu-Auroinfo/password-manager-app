import { useState } from 'react';
import { ILoginCredentials, IRegisterCredentials, IAuthResponse, IAuthError, IUser } from '../types';
import { AuthService } from '../services/auth.service';
import { generateMasterKey } from '../utils/encryption';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<IAuthError | null>(null);

    const login = async (credentials: ILoginCredentials): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthService.login(credentials);
            
            if (response.success && response.data) {
                // Store auth token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Generate and store master key
                const masterKey = generateMasterKey(
                    credentials.password,
                    response.data.user.email // Using email as salt
                );
                localStorage.setItem('masterKey', masterKey);

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
                // After successful registration, automatically log in
                const loginResponse = await AuthService.login({
                    email: credentials.email,
                    password: credentials.password
                });

                if (loginResponse.success && loginResponse.data) {
                    // Store auth token and user data
                    localStorage.setItem('token', loginResponse.data.token);
                    localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

                    // Generate and store master key
                    const masterKey = generateMasterKey(
                        credentials.password,
                        loginResponse.data.user.email
                    );
                    localStorage.setItem('masterKey', masterKey);
                }

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
        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('masterKey');
        AuthService.logout();
    };

    const getCurrentUser = (): IUser | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const getMasterKey = (): string | null => {
        return localStorage.getItem('masterKey');
    };

    const validateMasterKey = (): boolean => {
        const masterKey = localStorage.getItem('masterKey');
        const user = getCurrentUser();
        return !!(masterKey && user); // Returns true if both exist
    };

    return {
        login,
        register,
        logout,
        getCurrentUser,
        getMasterKey,
        validateMasterKey,
        loading,
        error
    };
};