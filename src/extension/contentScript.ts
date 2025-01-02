export {};

console.log('Content script loaded');

const findLoginForm = () => {
    const usernameInput = document.querySelector('input[type="text"], input[type="email"]') as HTMLInputElement | null;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
    
    return {
        usernameField: usernameInput,
        passwordField: passwordInput
    };
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FILL_CREDENTIALS') {
        const { usernameField, passwordField } = findLoginForm();
        
        if (usernameField && passwordField) {
            usernameField.value = message.username;
            passwordField.value = message.password;
            
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: 'Could not find login form' });
        }
    }
    return true;
});