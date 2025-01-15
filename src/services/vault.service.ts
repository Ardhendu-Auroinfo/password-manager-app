import { store } from '../store';
import { IPasswordEntry, IDecryptedPasswordEntry, ICreatePasswordEntry } from '../types/vault.types';
import { encryptData, decryptData } from '../utils/encryption';
import { config } from '../extension/config';
import { secureStore } from '../utils/secureStore';

const API_URL = config.API_URL;

export class VaultService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private static async request<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<T> {
        const token = store.getState().auth.token;
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        try {
            const response = await fetch(`${API_URL}/vault${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'An error occurred');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async getAllEntries(): Promise<IDecryptedPasswordEntry[]> {
        const entries = await this.request<IPasswordEntry[]>('/entries');
        return this.decryptEntries(entries);
    }

    static async getFavoriteEntries(): Promise<IDecryptedPasswordEntry[]> {
        const entries = await this.request<IPasswordEntry[]>('/entries/favorites');
        return this.decryptEntries(entries);
    }

    static async createEntry(entry: ICreatePasswordEntry): Promise<IDecryptedPasswordEntry> {
        try {
            const encryptedEntry = this.encryptEntry(entry);
            
            if (!encryptedEntry.encrypted_username || !encryptedEntry.encrypted_password) {
                throw new Error('Failed to encrypt entry data');
            }

            const response = await this.request<IPasswordEntry>('/entries', 'POST', encryptedEntry);
            
            if (!response) {
                throw new Error('No response from server');
            }

            return {
                id: response.id,
                vault_id: response.vault_id,
                title: entry.title,
                username: entry.username,
                password: entry.password,
                notes: entry.notes,
                website_url: entry.website_url || '',
                category: entry.category || '',
                favorite: entry.favorite || false,
                created_at: new Date(response.created_at),
                updated_at: new Date(response.updated_at),
                last_used: response.last_used ? new Date(response.last_used) : undefined,
                password_strength: response.password_strength || 0
            };
        } catch (error) {
            console.error('Create entry error:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to create entry');
        }
    }

    static async updateEntry(
        id: string, 
        entry: Partial<ICreatePasswordEntry>
    ): Promise<IDecryptedPasswordEntry> {
        const encryptedEntry = this.encryptEntry(entry);
        const response = await this.request<IPasswordEntry>(`/entries/${id}`, 'PUT', encryptedEntry);
        return this.decryptEntry(response);
    }

    static async deleteEntry(id: string): Promise<void> {
        await this.request(`/entries/${id}`, 'DELETE');
    }

    static async searchEntries(query: string): Promise<IDecryptedPasswordEntry[]> {
        const entries = await this.request<IPasswordEntry[]>(`/entries/search?q=${encodeURIComponent(query)}`);
        return this.decryptEntries(entries);
    }

    static async getEntryById(id: string): Promise<IDecryptedPasswordEntry> {
        const entry = await this.request<IPasswordEntry>(`/entries/${id}`);
        return this.decryptEntry(entry);
    }

    private static getMasterKey(): string {
        try {
            return secureStore.getVaultKey();
        } catch (error) {
            throw new Error('Vault key not found. Please login again.');
        }
    }

    public static encryptEntry(entry: Partial<ICreatePasswordEntry>): any {
        const encryptionKey = entry.sharedKey || this.getMasterKey();
        
        try {
            if (!entry.title || !entry.username || !entry.password) {
                throw new Error('Missing required fields');
            }

            let encryptedUsername, encryptedPassword, encryptedNotes;
            
            try {
                encryptedUsername = encryptData(entry.username, encryptionKey);
            } catch (error) {
                console.error('Username encryption failed:', error);
                throw new Error('Failed to encrypt username');
            }

            try {
                encryptedPassword = encryptData(entry.password, encryptionKey);
            } catch (error) {
                console.error('Password encryption failed:', error);
                throw new Error('Failed to encrypt password');
            }

            if (entry.notes) {
                try {
                    encryptedNotes = encryptData(entry.notes, encryptionKey);
                } catch (error) {
                    console.error('Notes encryption failed:', error);
                    encryptedNotes = null;
                }
            }

            return {
                title: entry.title,
                encrypted_username: encryptedUsername,
                encrypted_password: encryptedPassword,
                encrypted_notes: encryptedNotes,
                website_url: entry.website_url || '',
                category: entry.category || '',
                favorite: entry.favorite || false,
                isSharedUpdate: !!entry.sharedKey
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt password entry');
        }
    }

    public static decryptEntry(entry: IPasswordEntry, sharedKey?: string): IDecryptedPasswordEntry {
        const decryptionKey = sharedKey || this.getMasterKey();
        
        try {
            const decryptBufferData = (encryptedBuffer: any): string => {
                if (!encryptedBuffer) return '';
                
                try {
                    if (encryptedBuffer.data && Array.isArray(encryptedBuffer.data)) {
                        const uint8Array = new Uint8Array(encryptedBuffer.data);
                        const encryptedString = new TextDecoder().decode(uint8Array);
                        return decryptData(encryptedString, decryptionKey);
                    }
                    
                    if (typeof encryptedBuffer === 'string') {
                        return decryptData(encryptedBuffer, decryptionKey);
                    }

                    return '';
                } catch (error) {
                    console.error('Error decrypting buffer:', error);
                    return '';
                }
            };

            const decryptedData = {
                id: entry.id,
                vault_id: entry.vault_id,
                title: entry.title,
                username: decryptBufferData(entry.encrypted_username),
                password: decryptBufferData(entry.encrypted_password),
                notes: entry.encrypted_notes ? 
                    decryptBufferData(entry.encrypted_notes) : undefined,
                website_url: entry.website_url || '',
                category: entry.category || '',
                favorite: entry.favorite,
                last_used: entry.last_used ? new Date(entry.last_used) : undefined,
                password_strength: entry.password_strength || 0,
                created_at: new Date(entry.created_at),
                updated_at: new Date(entry.updated_at)
            };

            return decryptedData;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt password entry');
        }
    }

    private static decryptEntries(entries: IPasswordEntry[]): IDecryptedPasswordEntry[] {
        return entries.map(entry => {
            try {
                return this.decryptEntry(entry);
            } catch (error) {
                console.error(`Failed to decrypt entry ${entry.id}:`, error);
                // Return a placeholder for failed entries
                return {
                    id: entry.id,
                    vault_id: entry.vault_id,
                    title: entry.title,
                    username: '(Decryption failed)',
                    password: '(Decryption failed)',
                    notes: undefined,
                    website_url: entry.website_url || '',
                    category: entry.category || '',
                    favorite: entry.favorite,
                    last_used: entry.last_used ? new Date(entry.last_used) : undefined,
                    password_strength: entry.password_strength || 0,
                    created_at: new Date(entry.created_at),
                    updated_at: new Date(entry.updated_at)
                };
            }
        });
    }

    static async toggleFavorite(entryId: string): Promise<void> {
        await this.request(`/entries/${entryId}/favorite`, 'POST');
    }
}

export const vaultService = new VaultService();