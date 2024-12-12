import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { AuthProvider } from '../../contexts/AuthContext';
import { VaultProvider } from '../../contexts/VaultContext';
import Popup from './Popup';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const container = document.getElementById('root');
    
    if (!container) {
        console.error('Root element not found');
        throw new Error('Root element not found');
    }

    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <Provider store={store}>
                    <VaultProvider>
                        <Popup />
                    </VaultProvider>
            </Provider>
        </React.StrictMode>
    );
});