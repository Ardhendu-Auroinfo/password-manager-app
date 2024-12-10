import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVault } from '../../contexts/VaultContext';

const Popup: React.FC = () => {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const { isAuthenticated, user } = useAuth();
    const { entries } = useVault();

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                setCurrentUrl(new URL(tabs[0].url).hostname);
            }
        });
    }, []);

    if (!isAuthenticated) {
        return (
            <div className="p-4">
                <h2>Please log in</h2>
                <button 
                    onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/login' })}
                    className="btn btn-primary"
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="w-80 p-4">
            <h2>Passwords for {currentUrl}</h2>
            {/* Your password list UI */}
        </div>
    );
};

export default Popup;