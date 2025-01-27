export {};

const createPromptOverlay = (credentials: any) => {
  const existingPrompt = document.getElementById('lockdown-autosave-prompt');
  if (existingPrompt) return;

  // Initialize auth data first
  chrome.storage.local.get(['auth'], async (result) => {
    if (!result.auth?.isAuthenticated) {
      console.log('User not authenticated');
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'lockdown-autosave-prompt';
    overlay.className = 'overlay'; 

    // Add CSS that works for both light and dark themes
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: var(--lockdown-bg-color, #ffffff);
      color: var(--lockdown-text-color, #000000);
      border: 1px solid var(--lockdown-border-color, rgba(0, 0, 0, 0.1));
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      width: 320px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
  
    // Detect color scheme
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const styles = document.createElement('style');
    styles.textContent = `
      :root {
        --lockdown-bg-color: ${isDarkMode ? '#1f2937' : '#ffffff'};
        --lockdown-text-color: ${isDarkMode ? '#ffffff' : '#000000'};
        --lockdown-border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        --lockdown-secondary-text: ${isDarkMode ? '#9ca3af' : '#666666'};
        --lockdown-button-bg: ${isDarkMode ? '#374151' : '#f3f4f6'};
        --lockdown-button-hover: ${isDarkMode ? '#4b5563' : '#e5e7eb'};
      }
    `;
    document.head.appendChild(styles);
  
    const domain = new URL(credentials.url).hostname;

    const handleSave = async () => {
      const formData = {
        title: (document.getElementById('lockdown-title') as HTMLInputElement).value,
        username: (document.getElementById('lockdown-username') as HTMLInputElement).value,
        password: (document.getElementById('lockdown-password') as HTMLInputElement).value,
        website_url: (document.getElementById('lockdown-url') as HTMLInputElement).value,
        notes: '',
        category_id: '',
        favorite: false
      };

      try {
        // Save directly to storage first
        chrome.storage.local.get(['entries'], (result) => {
          const existingEntries = result.entries || [];
          const newEntries = [...existingEntries, formData];
          
          chrome.storage.local.set({ entries: newEntries }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error saving to storage:', chrome.runtime.lastError);
              return;
            }
            
            // After successful storage save, try to save to vault
            chrome.runtime.sendMessage({
              type: 'SAVE_ENTRIES',
              payload: [formData]
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error saving to vault:', chrome.runtime.lastError);
              } else if (response?.success) {
                handleClose();
                console.log('Entry saved successfully');
              }
            });
          });
        });
      } catch (error) {
        console.error('Failed to save credentials:', error);
      }
    };
  
    const handleClose = () => {
      overlay.remove();
      sessionStorage.removeItem('lockdown_pending_credentials');
    };
  
    // Form HTML with validation
    overlay.innerHTML = `
      <form id="lockdown-save-form" style="font-family: system-ui, -apple-system, sans-serif;">
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--lockdown-text-color);">Save Password?</h3>
            <button type="button" id="lockdown-close-prompt" style="background: none; border: none; cursor: pointer; padding: 4px; color: var(--lockdown-secondary-text);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <div style="margin-bottom: 8px;">
            <label style="display: block; color: var(--lockdown-secondary-text); margin-bottom: 4px;">Title</label>
            <input 
              type="text" 
              id="lockdown-title" 
              value="${credentials.title || ''}"
              required
              style="width: 100%; padding: 6px 8px; border: 1px solid var(--lockdown-border-color); border-radius: 4px; background: var(--lockdown-bg-color); color: var(--lockdown-text-color);"
            >
          </div>
  
          <div style="margin-bottom: 8px;">
            <label style="display: block; color: var(--lockdown-secondary-text); margin-bottom: 4px;">Username</label>
            <input 
              type="text" 
              id="lockdown-username" 
              value="${credentials.username || ''}"
              required
              style="width: 100%; padding: 6px 8px; border: 1px solid var(--lockdown-border-color); border-radius: 4px; background: var(--lockdown-bg-color); color: var(--lockdown-text-color);"
            >
          </div>
  
          <div style="margin-bottom: 8px;">
            <label style="display: block; color: var(--lockdown-secondary-text); margin-bottom: 4px;">Password</label>
            <input 
              type="password" 
              id="lockdown-password" 
              value="${credentials.password || ''}"
              required
              style="width: 100%; padding: 6px 8px; border: 1px solid var(--lockdown-border-color); border-radius: 4px; background: var(--lockdown-bg-color); color: var(--lockdown-text-color);"
            >
          </div>
  
          <input 
            type="hidden" 
            id="lockdown-url" 
            value="${credentials.url || ''}"
          >
        </div>
  
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" id="lockdown-cancel" style="padding: 6px 12px; border: none; border-radius: 4px; background: var(--lockdown-button-bg); color: var(--lockdown-text-color); cursor: pointer;">
            Cancel
          </button>
          <button type="submit" id="lockdown-save" style="padding: 6px 12px; border: none; border-radius: 4px; background: #2563eb; color: white; cursor: pointer;">
            Save Password
          </button>
        </div>
      </form>
    `;
  
    document.body.appendChild(overlay);
  
    sessionStorage.setItem('lockdown_pending_credentials', JSON.stringify(credentials));
  
    document.getElementById('lockdown-save-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSave();
    });
  
    document.getElementById('lockdown-close-prompt')?.addEventListener('click', handleClose);
    document.getElementById('lockdown-cancel')?.addEventListener('click', handleClose);
  });
};

// Check for pending credentials on page load
window.addEventListener('load', () => {
  const pendingCredentials = sessionStorage.getItem('lockdown_pending_credentials');
  if (pendingCredentials) {
    createPromptOverlay(JSON.parse(pendingCredentials));
  }
});

// Listen for the show prompt message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_AUTOSAVE_PROMPT') {
    createPromptOverlay(message.credentials);
    sendResponse({ success: true });
  }
  return false; // Don't keep the message channel open
});