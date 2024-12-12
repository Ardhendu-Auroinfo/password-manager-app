import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVault } from '../../contexts/VaultContext';
import { getBrowserAPI } from '../../utils/browser';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

const Popup: React.FC = () => {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const { isAuthenticated, user } = useAuth();
    const { entries, loading } = useVault();
    const dispatch = useDispatch();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const result = await chrome.storage.local.get('auth');
                console.log('Storage result:', result);
                
                if (result.auth) {
                    console.log('Found auth data:', result.auth);
                    dispatch(setCredentials(result.auth));
                } else {
                    console.log('No auth data found in storage');
                    dispatch(setCredentials(null));
                }
            } catch (error) {
                console.error('Error retrieving auth data:', error);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const authStateListener = (message: any) => {
            console.log('Received message in popup:', message);
            if (message.type === 'AUTH_STATE_CHANGED') {
                console.log('Auth state changed:', message.payload);
                dispatch(setCredentials(message.payload));
            }
        };

        chrome.runtime.onMessage.addListener(authStateListener);

        return () => {
            chrome.runtime.onMessage.removeListener(authStateListener);
        };
    }, [dispatch]);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                try {
                    const url = new URL(tabs[0].url);
                    setCurrentUrl(url.hostname);
                } catch (error) {
                    console.error('Invalid URL:', error);
                }
            }
        });
    }, []);

    // if (loading) {
    //     return (
    //         <div className="w-80 h-96 flex items-center justify-center bg-white">
    //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    //         </div>
    //     );
    // }

    if (!isAuthenticated) {
        return (
            <div className="w-80 h-96 bg-white p-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-blue-500 p-3 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Password Manager</h2>
                <p className="text-gray-600 text-center mb-6">
                    Securely access your passwords across the web
                </p>
                <div className="space-y-4">
                    <button 
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/login' })}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Login</span>
                    </button>
                    <button 
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/register' })}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Sign Up</span>
                    </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-6">
                    Your passwords are encrypted and secure
                </p>
            </div>
        );
    }

    return (
        <div className="w-80 h-96 bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 p-2 rounded-full">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">Password Manager</h2>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/settings' })}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Current Site Section */}
            {currentUrl && (
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Current Site
                    </h3>
                    <div className="flex items-center space-x-2">
                        <img 
                            src={`https://www.google.com/s2/favicons?domain=${currentUrl}`}
                            alt="Site favicon"
                            className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">{currentUrl}</span>
                    </div>
                </div>
            )}

            {/* Passwords List */}
            <div className="flex-1 overflow-auto p-4">
                <div className="space-y-2">
                    {entries
                        .filter(entry => entry.website_url?.includes(currentUrl))
                        .map(entry => (
                            <div 
                                key={entry.id}
                                className="p-3 bg-white border rounded-lg hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{entry.title}</h4>
                                        <p className="text-sm text-gray-500">{entry.username}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            chrome.tabs.query(
                                                { active: true, currentWindow: true },
                                                (tabs) => {
                                                    if (tabs[0]?.id) {
                                                        chrome.tabs.sendMessage(
                                                            tabs[0].id,
                                                            {
                                                                type: 'FILL_CREDENTIALS',
                                                                username: entry.username,
                                                                password: entry.password
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        }}
                                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        Fill
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
                <button 
                    onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/vault' })}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>Open Vault</span>
                </button>
            </div>
        </div>
    );
};

export default Popup;