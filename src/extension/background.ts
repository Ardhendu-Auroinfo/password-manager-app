import { AuthService } from '../services/auth.service';
import { VaultService } from '../services/vault.service';

export {};

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Handle authentication and other background tasks