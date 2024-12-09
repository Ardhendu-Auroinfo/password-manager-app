import { IPasswordEntry, IDecryptedPasswordEntry, ICreatePasswordEntry } from '../types/vault.types';
import { encryptData, decryptData } from '../utils/encryption';

const API_URL = process.env.REACT_APP_API_URL;

export class VaultService {
    private static async request<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<T> {
        const token = localStorage.getItem('token');
        
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
                    console.log('Session expired. Please login again.');
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

    static async createEntry(entry: ICreatePasswordEntry): Promise<IDecryptedPasswordEntry> {
        const encryptedEntry = this.encryptEntry(entry);
        const response = await this.request<IPasswordEntry>('/entries', 'POST', encryptedEntry);
        return this.decryptEntry(response);
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

    private static getMasterKey(): string {
        const masterKey = localStorage.getItem('masterKey');
        if (!masterKey) {
            throw new Error('Master key not found. Please login again.');
        }
        return masterKey;
    }

    private static encryptEntry(entry: Partial<ICreatePasswordEntry>): any {
        const masterKey = this.getMasterKey();
        
        try {
            return {
                ...entry,
                username: entry.username ? encryptData(entry.username, masterKey) : undefined,
                password: entry.password ? encryptData(entry.password, masterKey) : undefined,
                notes: entry.notes ? encryptData(entry.notes, masterKey) : undefined,
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt password entry. Please ensure you are logged in.');
        }
    }

    private static decryptEntry(entry: IPasswordEntry): IDecryptedPasswordEntry {
        const masterKey = this.getMasterKey();
        
        try {
            return {
                id: entry.id,
                vault_id: entry.vault_id,
                title: entry.title,
                username: decryptData(entry.encrypted_username, masterKey),
                password: decryptData(entry.encrypted_password, masterKey),
                notes: entry.encrypted_notes ? decryptData(entry.encrypted_notes, masterKey) : undefined,
                website_url: entry.website_url,
                category: entry.category,
                favorite: entry.favorite,
                last_used: entry.last_used,
                password_strength: entry.password_strength,
                created_at: entry.created_at,
                updated_at: entry.updated_at
            };
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt password entry. Please ensure you are logged in.');
        }
    }

    private static decryptEntries(entries: IPasswordEntry[]): IDecryptedPasswordEntry[] {
        return entries.map(entry => this.decryptEntry(entry));
    }
}