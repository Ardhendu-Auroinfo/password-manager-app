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
        try {
            chrome.storage.local.get(['entries'], (result) => {
                const existingEntries = result.entries || [];
                const newEntries = Array.isArray(message.payload) 
                    ? [...existingEntries, ...message.payload]
                    : existingEntries;

                saveEntriesToStorage(newEntries);

                // Verify that the entries are saved
                chrome.storage.local.get(['entries'], (updatedResult) => {
                    console.log('Updated entries:', updatedResult.entries);
                });

                sendResponse({ success: true });
            });
        } catch (error) {
            console.error('Error saving entries:', error);
            sendResponse({ success: false });
        }
        return true;
    }

    return true; 
});

// Listen for internal messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
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
    
    if (message.type === 'FORM_SUBMITTED') {
        console.log('Processing form submission');
        // Delay showing the prompt to handle redirects
        setTimeout(() => {
            chrome.storage.local.get(['auth'], (result) => {
                if (result.auth?.isAuthenticated) {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        if (tabs[0]?.id) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                type: 'SHOW_AUTOSAVE_PROMPT',
                                credentials: message.credentials
                            });
                        }
                    });
                }
            });
        }, 1000); // 1 second delay
        return true;
    }
    
    if (message.type === 'SAVE_CREDENTIALS') {
        try {
            const entry = {
                title: message.credentials.title,
                username: message.credentials.username,
                password: message.credentials.password,
                website_url: message.credentials.url,
                notes: '',
                category_id: '',
                favorite: false,
            };
            
            // Use your VaultService to save the entry
            chrome.runtime.sendMessage({
                type: 'CREATE_ENTRY',
                entry
            }, (response) => {
                sendResponse({ success: true });
            });
        } catch (error) {
            console.error('Failed to save credentials:', error);
            sendResponse({ success: false });
        }
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