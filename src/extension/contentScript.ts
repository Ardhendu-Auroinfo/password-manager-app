export {};

console.log('Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message); // Debug log
    
    if (message.type === 'FILL_CREDENTIALS') {
        const { username, password } = message;
        console.log('Filling credentials for:', username); // Debug log
        
        // Try multiple selector patterns
        const passwordFields = document.querySelectorAll('input[type="password"]');
        const usernameFields = document.querySelectorAll('input[type="text"], input[type="email"], input[name="email"], input[name="username"]');

        console.log('Found fields:', { 
            usernameFields: usernameFields.length, 
            passwordFields: passwordFields.length 
        }); // Debug log

        if (usernameFields.length > 0 && passwordFields.length > 0) {
            // Fill username
            const usernameField = usernameFields[0] as HTMLInputElement;
            usernameField.value = username;
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
            usernameField.dispatchEvent(new Event('change', { bubbles: true }));

            // Fill password
            const passwordField = passwordFields[0] as HTMLInputElement;
            passwordField.value = password;
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('Credentials filled successfully'); // Debug log
        }
    }
    return true;
});