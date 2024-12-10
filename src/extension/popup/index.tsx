import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Popup from './Popup';
import '../../index.css'; // If you want to use your existing styles

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the root element from popup.html
    const container = document.getElementById('root');
    
    if (!container) {
        throw new Error('Root element not found');
    }

    // Create a root
    const root = createRoot(container);

    // Render the Popup component
    root.render(
        <React.StrictMode>
            <Provider store={store}>
                <div className="w-96 min-h-[400px] bg-white">
                    <Popup />
                </div>
            </Provider>
        </React.StrictMode>
    );
});