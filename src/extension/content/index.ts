export {};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FILL_CREDENTIALS') {
        const { username, password } = message;
        
        const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement | null;
        const usernameField = document.querySelector('input[type="text"], input[type="email"]') as HTMLInputElement | null;

        if (usernameField && passwordField) {
            usernameField.value = username;
            passwordField.value = password;
            
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    return true;
});