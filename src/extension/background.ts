

export {};

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Listen for messages from web app and content scripts
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    console.log('Received external message:', message, 'from:', sender);

    if (message.type === 'SAVE_AUTH_DATA') {
        chrome.storage.local.set({ auth: message.payload }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving auth data:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                console.log('Auth data saved successfully');
                chrome.runtime.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    payload: message.payload
                });
                sendResponse({ success: true });
            }
        });
    }

    if (message.type === 'CLEAR_AUTH_DATA') {
        // Clear auth data from extension storage
        chrome.storage.local.remove('auth', () => {
            if (chrome.runtime.lastError) {
                console.error('Error clearing auth data:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                console.log('Auth data cleared successfully');
                // Notify popup about the auth state change
                chrome.runtime.sendMessage({
                    type: 'AUTH_STATE_CHANGED',
                    payload: null
                });
                sendResponse({ success: true });
            }
        });
    }

    return true;
});

// Listen for internal messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received internal message:', message);
    
    if (message.type === 'AUTH_STATE_CHANGED') {
        chrome.storage.local.set({ auth: message.payload });
    }

    if (message.type === 'GET_CREDENTIALS') {
        chrome.storage.local.get('auth', async (result) => {
            try {
                if (!result.auth) {
                    sendResponse({ credentials: [] });
                    return;
                }

                const url = new URL(message.url);
                const domain = url.hostname;

                // Get entries from storage
                const { entries = [] } = await chrome.storage.local.get('entries');
                console.log('Entries:', entries);
                
                // Filter entries matching the domain
                const matchingCredentials = entries.filter((entry: any) => {
                    if (!entry.website_url) return false;
                    try {
                        const entryDomain = new URL(entry.website_url).hostname;
                        return entryDomain === domain;
                    } catch {
                        return false;
                    }
                });

                sendResponse({ credentials: matchingCredentials });
            } catch (error) {
                console.error('Error fetching credentials:', error);
                sendResponse({ credentials: [] });
            }
        });
    }
    
    return true;
});

// Handle authentication and other background tasks