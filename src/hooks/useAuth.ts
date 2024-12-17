import { useAppDispatch, useAppSelector } from './useRedux';
import { AuthService } from '../services/auth.service';
import { setCredentials, logout } from '../store/slices/authSlice';
import { ILoginCredentials, IRegisterCredentials } from '../types/auth.types';
import { generateMasterKey } from '../utils/encryption';
import { browser } from 'webextension-polyfill-ts';
import { getBrowserAPI } from '../utils/browser';
import { config } from '../extension/config';

const EXTENSION_ID = config.EXTENSION_ID;

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, masterKey, loading, error, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const saveAuthToExtension = async (authData: any) => {
        try {
            // Try direct extension API first
            const browser = getBrowserAPI();
            if (browser) {
                await browser.storage.local.set({ auth: authData });
                console.log('Auth data saved directly to extension storage');
                return;
            }

            // If not in extension context, try to communicate with the extension
            if (window.chrome && chrome.runtime && EXTENSION_ID) {
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Communication timeout'));
                    }, 5000); // 5 second timeout

                    chrome.runtime?.sendMessage(
                        EXTENSION_ID,
                        { 
                            type: 'SAVE_AUTH_DATA',
                            payload: authData 
                        },
                        (response) => {
                            clearTimeout(timeout);
                            
                            if (chrome.runtime.lastError) {
                                console.error('Extension communication failed:', chrome.runtime.lastError);
                                reject(chrome.runtime.lastError);
                                return;
                            }
                            
                            if (response && response.success) {
                                console.log('Auth data sent to extension:', response);
                                resolve(response);
                            } else {
                                reject(new Error('Failed to save auth data'));
                            }
                        }
                    );
                });
            } else {
                console.log('No extension communication available');
            }
        } catch (error) {
            console.error('Failed to sync auth data to extension:', error);
            throw error;
        }
    };

    const login = async (credentials: ILoginCredentials) => {
        try {
            const response = await AuthService.login(credentials);
            
            if (response.success && response.data) {
                const masterKey = generateMasterKey(
                    credentials.password,
                    response.data.user.email
                );

                const authData = {
                    user: response.data.user,
                    token: response.data.token,
                    masterKey,
                    isAuthenticated: true
                };

                dispatch(setCredentials(authData));
                
                try {
                    await saveAuthToExtension(authData);
                    console.log('Auth data successfully synced with extension');
                } catch (error) {
                    console.error('Failed to sync with extension, but login successful:', error);
                }
                
                return { success: true };
            }
            return { 
                success: false, 
                error: response.message || 'Login failed' 
            };
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'An error occurred during login';
            console.error('Login error:', err);
            return { 
                success: false, 
                error: errorMessage 
            };
        }
    };

    const register = async (credentials: IRegisterCredentials) => {
        try {
            const response = await AuthService.register(credentials);
            
            if (response.success) {
                return await login({
                    email: credentials.email,
                    password: credentials.password
                });
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logoutUser = async () => {
        try {
            // Clear Redux state
            dispatch(logout());
            AuthService.logout();

            // Try direct extension API first
            const browser = getBrowserAPI();
            if (browser) {
                await browser.storage.local.remove('auth');
                // Also send a message to notify the extension
                chrome.runtime?.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    payload: null
                });
                console.log('Auth data cleared from extension storage');
                return;
            }

            // If not in extension context, try to communicate with the extension
            if (window.chrome && chrome.runtime && EXTENSION_ID) {
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Communication timeout'));
                    }, 5000);

                    chrome.runtime?.sendMessage(
                        EXTENSION_ID,
                        { 
                            type: 'CLEAR_AUTH_DATA'
                        },
                        (response) => {
                            clearTimeout(timeout);
                            
                            if (chrome.runtime.lastError) {
                                console.error('Extension communication failed:', chrome.runtime.lastError);
                                reject(chrome.runtime.lastError);
                                return;
                            }
                            
                            if (response && response.success) {
                                console.log('Auth data cleared from extension');
                                // Notify about state change
                                chrome.runtime?.sendMessage({
                                    type: 'AUTH_STATE_CHANGED',
                                    payload: null
                                });
                                resolve(response);
                            } else {
                                reject(new Error('Failed to clear auth data'));
                            }
                        }
                    );
                });
            } else {
                console.log('No extension communication available');
            }
        } catch (error) {
            console.error('Failed to clear extension auth data:', error);
        }
    };

    return {
        user,
        token,
        masterKey,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: logoutUser
    };
};