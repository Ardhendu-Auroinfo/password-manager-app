import { store } from '../../store'; // Your existing Redux store

// Ensure there's an export
export {};

// Listen for messages from web app and content scripts
chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        console.log('Received message:', message, 'from:', sender);

        if (message.type === 'SAVE_AUTH_DATA') {
            // Save auth data to extension storage
            chrome.storage.local.set({ auth: message.payload }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving auth data:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError });
                } else {
                    console.log('Auth data saved successfully');
                    sendResponse({ success: true });
                }
            });

            // Notify popup about the auth state change
            chrome.runtime.sendMessage({
                type: 'AUTH_STATE_CHANGED',
                payload: message.payload
            });
        }

        // Required for async sendResponse
        return true;
    }
);

// Listen for auth state changes within the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_STATE_CHANGED') {
        // Update chrome.storage with new auth state
        chrome.storage.local.set({ auth: message.payload });
    }
    return true;
});