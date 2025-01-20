export {};

console.log('Content script loaded');

// Inject CSS for icons and dropdowns
const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .lockdown-input-wrapper {
            position: relative;
            display: inline-block;
            width: 100%;
        }
        .lockdown-autofill-btn {
            position: absolute;
            right: 30px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            z-index: 999998;
            display: flex;
            align-items: center;
            opacity: 0.6;
        }
        .lockdown-autofill-btn:hover {
            opacity: 1;
        }
        .lockdown-credentials-dropdown {
            position: absolute;
            top: calc(100% + 5px);
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: 999999;
            max-width: 300px;
            /* Add these for dark backgrounds */
            background-color: white;
            color: #333;
        }
        .lockdown-credentials-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            background-color: white;
            color: #333;
        }
        .lockdown-credentials-item:hover {
            background-color: #f5f5f5;
        }
        .lockdown-credentials-item:last-child {
            border-bottom: none;
        }
    `;
    document.head.appendChild(style);
};

const showCredentialsDropdown = (credentials: any[], targetInput: HTMLElement) => {
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.lockdown-credentials-dropdown');
    existingDropdown?.remove();

    // Create new dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'lockdown-credentials-dropdown';

    credentials.forEach(cred => {
        const item = document.createElement('div');
        item.className = 'lockdown-credentials-item';
        item.textContent = `${cred.title} (${cred.username})`;
        item.onclick = () => {
            fillCredentials(cred);
            dropdown.remove();
        };
        dropdown.appendChild(item);
    });

    // Position dropdown relative to the input
    targetInput.parentElement?.appendChild(dropdown);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target as Node)) {
            dropdown.remove();
        }
    }, { once: true });
};

const addAutofillButton = (input: Element) => {
    if (!(input instanceof HTMLInputElement)) return;
    
    // Only add if not already present
    if (input.parentElement?.querySelector('.lockdown-autofill-btn')) return;

    // Check for existing buttons or icons
    const inputRect = input.getBoundingClientRect();
    const existingElements = Array.from(input.parentElement?.children || [])
        .filter(el => {
            if (el === input) return false;
            const rect = el.getBoundingClientRect();
            return rect.right > inputRect.right - 40; // Check if element is in the right area
        });

    // Create wrapper if it doesn't exist
    let wrapper = input.parentElement;
    if (!wrapper || !wrapper.classList.contains('lockdown-input-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'lockdown-input-wrapper';
        input.parentNode?.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    }

    const autofillButton = document.createElement('button');
    autofillButton.type = 'button';
    autofillButton.className = 'lockdown-autofill-btn';
    
    // Adjust position if there are existing elements
    if (existingElements.length > 0) {
        autofillButton.style.right = '60px'; // Move further left
    }

    autofillButton.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
    `;
    autofillButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        requestCredentials(input);
    };

    wrapper.appendChild(autofillButton);
};

const requestCredentials = async (targetInput: HTMLElement) => {
    const currentUrl = window.location.href;
    console.log('Requesting credentials for URL:', currentUrl);
    
    chrome.runtime.sendMessage({
        type: 'GET_CREDENTIALS',
        url: currentUrl
    }, (response) => {
        console.log('Response from background:', response);
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError);
        }
        if (response?.credentials?.length) {
            console.log('Found matching credentials:', response.credentials);
            showCredentialsDropdown(response.credentials, targetInput);
        } else {
            console.log('No matching credentials found');
        }
    });
};

const fillCredentials = ({ username, password }: { username: string, password: string }) => {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    const usernameFields = document.querySelectorAll('input[type="text"], input[type="email"], input[name="email"], input[name="username"]');

    if (usernameFields.length > 0 && passwordFields.length > 0) {
        const usernameField = usernameFields[0] as HTMLInputElement;
        const passwordField = passwordFields[0] as HTMLInputElement;

        usernameField.value = username;
        passwordField.value = password;

        [usernameField, passwordField].forEach(field => {
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FILL_CREDENTIALS') {
        fillCredentials(message);
    }
    return true;
});

// Initialize
const init = () => {
    injectStyles();
    document.querySelectorAll('input[type="password"]').forEach((element) => {
        addAutofillButton(element);
    });
};

// Run on page load
init();

// Monitor for dynamically added password fields
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
                node.querySelectorAll('input[type="password"]').forEach((element) => {
                    addAutofillButton(element);
                });
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});