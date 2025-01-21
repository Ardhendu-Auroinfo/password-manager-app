export {};

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    // Initialize storage
    chrome.storage.local.get(['auth', 'entries'], (result) => {
        console.log('Initial storage state:', result);
    });
});

// At the top of the file, add a function to handle entries
const saveEntriesToStorage = (entries: any[]) => {
    chrome.storage.local.set({ entries }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving entries:', chrome.runtime.lastError);
        } else {
            console.log('Entries saved successfully:', entries.length);
        }
    });
};

// Listen for messages from web app and content scripts
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    console.log('Received external message:', message, 'from:', sender);

    if (message.type === 'SAVE_AUTH_DATA') {
        try {
            chrome.storage.local.set({ auth: message.payload }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error saving auth data:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError });
                } else {
                    console.log('Auth data saved successfully');
                    // Broadcast to all extension components
                    chrome.runtime.sendMessage({
                        type: 'AUTH_STATE_CHANGED',
                        payload: message.payload
                    });
                    sendResponse({ success: true });
                }
            });
        } catch (error) {
            console.error('Error in SAVE_AUTH_DATA:', error);
            sendResponse({ success: false, error });
        }
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

    if (message.type === 'SAVE_ENTRIES') {
        saveEntriesToStorage(message.payload);
        sendResponse({ success: true });
    }

    return true; // Keep the message channel open for async response
});

// Listen for internal messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received internal message:', message);
    
    if (message.type === 'AUTH_STATE_CHANGED') {
        chrome.storage.local.set({ auth: message.payload });
    }

    if (message.type === 'SAVE_ENTRIES') {
        saveEntriesToStorage(message.payload);
        sendResponse({ success: true });
    }

    if (message.type === 'GET_CREDENTIALS') {
        // First try to get entries from storage
        chrome.storage.local.get(['auth', 'entries'], async (result) => {
            try {
                if (!result.auth) {
                    sendResponse({ credentials: [] });
                    return;
                }

                // If no entries in storage, try to fetch them
                if (!result.entries) {
                    // You'll need to implement this function in your VaultService
                    chrome.runtime.sendMessage(
                        { type: 'FETCH_ENTRIES' },
                        (fetchResponse) => {
                            if (fetchResponse?.entries) {
                                saveEntriesToStorage(fetchResponse.entries);
                                matchAndSendCredentials(fetchResponse.entries, message.url, sendResponse);
                            } else {
                                sendResponse({ credentials: [] });
                            }
                        }
                    );
                } else {
                    matchAndSendCredentials(result.entries, message.url, sendResponse);
                }
            } catch (error) {
                console.error('Error in GET_CREDENTIALS:', error);
                sendResponse({ credentials: [] });
            }
        });
        return true;
    }
    
    return true;
});

// Helper function to match credentials
const matchAndSendCredentials = (entries: any[], url: string, sendResponse: Function) => {
    const domain = new URL(url).hostname;
    const matchingCredentials = entries.filter(entry => {
        if (!entry.website_url) return false;
        try {
            const cleanUrl = entry.website_url.startsWith('@') 
                ? entry.website_url.substring(1) 
                : entry.website_url;
            const entryDomain = new URL(cleanUrl).hostname;
            return entryDomain === domain;
        } catch (error) {
            return false;
        }
    });
    sendResponse({ credentials: matchingCredentials });
};

// Handle authentication and other background tasks