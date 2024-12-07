import { IPasswordEntry, ICreatePasswordEntry, IDecryptedPasswordEntry } from '../types/vault.types';
import { encryptData, decryptData } from '../utils/encryption';

const API_URL = process.env.REACT_APP_API_URL;

export class VaultService {
    private static async request<T>(
        endpoint: string,
        method: string = 'GET',
        body?: any
    ): Promise<T> {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'An error occurred');
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async getAllEntries(): Promise<IDecryptedPasswordEntry[]> {
        const entries = await this.request<IPasswordEntry[]>('/vault/entries');
        const masterKey = localStorage.getItem('masterKey');
        
        if (!masterKey) {
            throw new Error('Master key not found');
        }

        return entries.map(entry => ({
            ...entry,
            username: decryptData(entry.encrypted_username, masterKey),
            password: decryptData(entry.encrypted_password, masterKey),
            notes: entry.encrypted_notes ? decryptData(entry.encrypted_notes, masterKey) : undefined
        }));
    }

    static async createEntry(entry: ICreatePasswordEntry): Promise<IDecryptedPasswordEntry> {
        const masterKey = localStorage.getItem('masterKey');
        
        if (!masterKey) {
            throw new Error('Master key not found');
        }

        const encryptedEntry = {
            title: entry.title,
            encrypted_username: encryptData(entry.username, masterKey),
            encrypted_password: encryptData(entry.password, masterKey),
            encrypted_notes: entry.notes ? encryptData(entry.notes, masterKey) : undefined,
            website_url: entry.website_url,
            category: entry.category,
            favorite: entry.favorite
        };

        const response = await this.request<IPasswordEntry>(
            '/vault/entries',
            'POST',
            encryptedEntry
        );

        return {
            ...response,
            username: entry.username,
            password: entry.password,
            notes: entry.notes
        };
    }

    static async updateEntry(
        id: string,
        entry: Partial<ICreatePasswordEntry>
    ): Promise<IDecryptedPasswordEntry> {
        const masterKey = localStorage.getItem('masterKey');
        
        if (!masterKey) {
            throw new Error('Master key not found');
        }

        const encryptedEntry: any = {
            ...entry,
            ...(entry.username && { encrypted_username: encryptData(entry.username, masterKey) }),
            ...(entry.password && { encrypted_password: encryptData(entry.password, masterKey) }),
            ...(entry.notes && { encrypted_notes: encryptData(entry.notes, masterKey) })
        };

        // Remove unencrypted fields
        delete encryptedEntry.username;
        delete encryptedEntry.password;
        delete encryptedEntry.notes;

        const response = await this.request<IPasswordEntry>(
            `/vault/entries/${id}`,
            'PUT',
            encryptedEntry
        );

        return {
            ...response,
            username: decryptData(response.encrypted_username, masterKey),
            password: decryptData(response.encrypted_password, masterKey),
            notes: response.encrypted_notes ? decryptData(response.encrypted_notes, masterKey) : undefined
        };
    }

    static async deleteEntry(id: string): Promise<void> {
        await this.request(`/vault/entries/${id}`, 'DELETE');
    }

    static async searchEntries(query: string): Promise<IDecryptedPasswordEntry[]> {
        const entries = await this.request<IPasswordEntry[]>(`/vault/entries/search?q=${encodeURIComponent(query)}`);
        const masterKey = localStorage.getItem('masterKey');
        
        if (!masterKey) {
            throw new Error('Master key not found');
        }

        return entries.map(entry => ({
            ...entry,
            username: decryptData(entry.encrypted_username, masterKey),
            password: decryptData(entry.encrypted_password, masterKey),
            notes: entry.encrypted_notes ? decryptData(entry.encrypted_notes, masterKey) : undefined
        }));
    }
}