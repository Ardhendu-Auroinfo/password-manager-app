import React, { useEffect } from 'react';
import { VaultService } from '../../../services/vault.service';

interface Credentials {
  username: string;
  password: string;
  url: string;
}

const AutosaveDetector: React.FC = () => {
  useEffect(() => {
    const checkCredentials = async () => {
      const existingEntries = await VaultService.getAllEntries();
      
      chrome.storage.local.get(['pendingCredentials'], (result) => {
        if (result.pendingCredentials) {
          const credentials = result.pendingCredentials;
          const domain = new URL(credentials.url).hostname;
          
          const hasExisting = existingEntries.some(entry => {
            try {
              const entryDomain = new URL(entry.website_url || '').hostname;
              return entryDomain === domain && entry.username === credentials.username;
            } catch {
              return false;
            }
          });
          
          if (!hasExisting) {
            chrome.runtime.sendMessage({
              type: 'SHOW_AUTOSAVE_PROMPT',
              credentials
            });
          }
        }
      });
    };

    checkCredentials();
    
    const interval = setInterval(checkCredentials, 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default AutosaveDetector;