import { useAppDispatch, useAppSelector } from './useRedux';
import { AuthService } from '../services/auth.service';
import { setCredentials, logout } from '../store/slices/authSlice';
import { ILoginCredentials, IRegisterCredentials } from '../types/auth.types';
import { deriveKeys, decryptVaultKey } from '../utils/encryption';
import { secureStore } from '../utils/secureStore';
import { getBrowserAPI } from '../utils/browser';
import { config } from '../extension/config';

const EXTENSION_ID = config.EXTENSION_ID;

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, loading, error, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const saveAuthToExtension = async (authData: any) => {
        try {
            const safeAuthData = {
                user: authData.user,
                token: authData.token,
                isAuthenticated: authData.isAuthenticated,
                vaultKey: secureStore.getVaultKey(),
                encryptionKey: secureStore.getEncryptionKey(),
                symmetricKey: secureStore.getSymmetricKey()
            };

            // Try direct storage first
            if (chrome.storage && chrome.storage.local) {
                await chrome.storage.local.set({ auth: safeAuthData });
                console.log('Auth data saved directly to extension storage');
                return { success: true };
            }

            // Fallback to external messaging
            if (chrome.runtime && EXTENSION_ID) {
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Communication timeout'));
                    }, 5000);

                    try {
                        chrome.runtime.sendMessage(
                            EXTENSION_ID,
                            { 
                                type: 'SAVE_AUTH_DATA',
                                payload: safeAuthData 
                            },
                            (response) => {
                                clearTimeout(timeout);
                                
                                if (chrome.runtime.lastError) {
                                    console.error('Extension communication failed:', chrome.runtime.lastError);
                                    reject(chrome.runtime.lastError);
                                    return;
                                }
                                
                                if (response && response.success) {
                                    console.log('Auth data sent to extension successfully');
                                    resolve(response);
                                } else {
                                    reject(new Error('Failed to save auth data'));
                                }
                            }
                        );
                    } catch (error) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                });
            }

            throw new Error('No extension communication method available');
        } catch (error) {
            console.error('Error saving auth data to extension:', error);
            throw error;
        }
    };

    const login = async (credentials: ILoginCredentials) => {
        try {
            // First derive the keys
            const { authKey, encryptionKey, symmetricKey } = deriveKeys(
                credentials.password,
                credentials.email
            );


            // Make the login request
            const response = await AuthService.login({
                email: credentials.email,
                authKey: authKey
            });

            if (response.success && response.data) {
                try {
                    if (!response.data.encryptedVaultKey) {
                        throw new Error('Server response missing encrypted vault key');
                    }

                    // Decrypt vault key
                    const vaultKey = decryptVaultKey(
                        response.data.encryptedVaultKey,
                        encryptionKey
                    );

                    // Store the keys
                    secureStore.setKeys(
                        encryptionKey,
                        symmetricKey,
                        vaultKey
                    );

                    const authData = {
                        user: response.data.user,
                        token: response.data.token,
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
                } catch (decryptError) {
                    console.error('Decryption error:', decryptError);
                    return {
                        success: false,
                        error: 'Failed to decrypt vault key'
                    };
                }
            }

            return {
                success: false,
                error: response.message || 'Login failed'
            };
        } catch (err: any) {
            console.error('Login error:', err);
            return {
                success: false,
                error: err.message || 'An error occurred during login'
            };
        }
    };

    const register = async (credentials: IRegisterCredentials) => {
        try {
            const response = await AuthService.register(credentials);
            
            if (response.success) {
                // return await login({
                //     email: credentials.email,
                //     password: credentials.password
                // });
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logoutUser = async () => {
        try {
            // Clear sensitive data from memory
            secureStore.clearKeys();
            
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
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: logoutUser
    };
};