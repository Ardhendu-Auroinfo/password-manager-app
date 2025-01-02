import { ILoginCredentials, IRegisterCredentials, IAuthResponse, IPasswordEntry, IDecryptedPasswordEntry, ICreatePasswordEntry } from '../types';
import { decryptData, decryptVaultKey, deriveKeys, encryptData, encryptKeyData, encryptVaultKey } from '../utils/encryption';
import { secureStore } from '../utils/secureStore';
import { VaultService } from './vault.service';

const API_URL = process.env.REACT_APP_API_URL;

interface ILoginRequest {
    email: string;
    authKey: string;
}

export const AuthService = {
    async login(credentials: ILoginRequest): Promise<IAuthResponse> {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Login failed');
        }
    },

    async register(credentials: IRegisterCredentials): Promise<IAuthResponse> {
        try {
            // Derive keys on client side
            const { authKey, encryptionKey, symmetricKey } = deriveKeys(
                credentials.password,
                credentials.email
            );
            // Encrypt symmetric key with encryption key
            const encryptedVaultKey = encryptVaultKey(symmetricKey, encryptionKey);
            
            const encryptedKey = encryptKeyData(encryptionKey); // Use your encryption function
            // Send only derived auth key to server, never the master password
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    authKey: authKey,
                    encryptedVaultKey: encryptedVaultKey,
                    encryptedKey: encryptedKey,
                    masterPasswordHint: credentials.masterPasswordHint
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error('Registration failed');
        }
    },

    logout(): void {
        // No need to handle localStorage here
    },
    encryptEntry(entry: Partial<ICreatePasswordEntry>, vaultKey: string): any {
        
        try {
            if (!entry.title || !entry.username || !entry.password) {
                throw new Error('Missing required fields');
            }

            let encryptedUsername, encryptedPassword, encryptedNotes;
            
            try {
                encryptedUsername = encryptData(entry.username, vaultKey);
            } catch (error) {
                console.error('Username encryption failed:', error);
                throw new Error('Failed to encrypt username');
            }

            try {
                encryptedPassword = encryptData(entry.password, vaultKey);
            } catch (error) {
                console.error('Password encryption failed:', error);
                throw new Error('Failed to encrypt password');
            }

            if (entry.notes) {
                try {
                    encryptedNotes = encryptData(entry.notes, vaultKey);
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
                favorite: entry.favorite || false
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt password entry');
        }
    },
    async decryptEntry(entry: IPasswordEntry, vaultKey: string): Promise<IDecryptedPasswordEntry> {
        try {
            // Helper function to safely decrypt buffer data
            const decryptBufferData = (encryptedBuffer: any): string => {
                if (!encryptedBuffer) return '';

                try {
                    // Handle buffer data from server
                    if (encryptedBuffer.data && Array.isArray(encryptedBuffer.data)) {
                        // Convert array back to encrypted string
                        const uint8Array = new Uint8Array(encryptedBuffer.data);
                        const encryptedString = new TextDecoder().decode(uint8Array);
                        
                        // Decrypt the data
                        return decryptData(encryptedString, vaultKey);
                    }
                    
                    // If it's already a string
                    if (typeof encryptedBuffer === 'string') {
                        return decryptData(encryptedBuffer, vaultKey);
                    }

                    return '';
                } catch (error) {
                    console.error('Error decrypting buffer:', error, {
                        bufferType: typeof encryptedBuffer,
                        hasData: !!encryptedBuffer?.data
                    });
                    return ''; // Return empty string instead of throwing
                }
            };

            console.log("Decrypting entry:", entry.encrypted_username);

            // Decode encrypted data with error handling for each field
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

            console.log("Decrypted data:", decryptedData);

            // Validate decrypted data
            if (!decryptedData.username || !decryptedData.password) {
                throw new Error('Failed to decrypt critical fields');
            }

            return decryptedData;
        } catch (error) {
            console.error('Error processing entry:', error);
            // Return a partially decrypted entry instead of throwing
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
    },

     async forgotPassword(email: string): Promise<any> {
        try {

            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async getPasswordHint(email: string): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/users/password-hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    async requestPasswordReset(email: string): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async verifyRecoveryToken(email: string, token: string): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/users/verify-recovery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token }),
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    async resetPassword(tempToken: string, newPassword: string, email: string, encryptedVaultKey: string): Promise<any> {
        try {
            // Get all entries using temp token
            const response = await fetch(`${API_URL}/vault/entries-for-reset`, {
                headers: {
                    'Authorization': `Bearer ${tempToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch entries');
            }

            const entries = await response.json();

            // Generate new keys for the new password
            const { authKey, encryptionKey, symmetricKey } = deriveKeys(newPassword, email);
            const newEncryptedVaultKey = encryptVaultKey(symmetricKey, encryptionKey);

            const vaultKey = secureStore.getVaultKey();

            // Re-encrypt entries with new symmetric key
            const reEncryptedEntries = entries.map((entry: IPasswordEntry) => {
                try {
                    // Convert Buffer data to string
                    const username = entry.encrypted_username.data ? 
                        new TextDecoder().decode(new Uint8Array(entry.encrypted_username.data)) : '';
                    const password = entry.encrypted_password.data ? 
                        new TextDecoder().decode(new Uint8Array(entry.encrypted_password.data)) : '';
                    const notes = entry.encrypted_notes ? 
                        new TextDecoder().decode(new Uint8Array(entry.encrypted_notes.data)) : null;

                    // Decrypt with the old vault key
                    const decryptedUsername = decryptData(username, vaultKey);
                    const decryptedPassword = decryptData(password, vaultKey);
                    const decryptedNotes = notes ? decryptData(notes, vaultKey) : null;


                    // Re-encrypt with new symmetric key
                    return {
                        id: entry.id,
                        encrypted_username: encryptData(decryptedUsername, symmetricKey),
                        encrypted_password: encryptData(decryptedPassword, symmetricKey),
                        encrypted_notes: decryptedNotes ? 
                            encryptData(decryptedNotes, symmetricKey) : null,
                        vault_id: entry.vault_id
                    };
                } catch (error) {
                    console.error(`Failed to process entry ${entry.id}:`, error);
                    
                    throw new Error(`Failed to process entry ${entry.id}`);
                }
            });

            // Send reset request
            const encryptedKey = encryptKeyData(encryptionKey);

            const resetResponse = await fetch(`${API_URL}/users/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({
                    authKey,
                    encryptedVaultKey: newEncryptedVaultKey,
                    reEncryptedEntries,
                    email,
                    encryptionKey: encryptedKey
                })
            });

            if (!resetResponse.ok) {
                const errorData = await resetResponse.json();
                throw new Error(errorData.message || 'Password reset failed');
            }

            const data = await resetResponse.json();
            
            if (data.success) {
                // Store the new keys
                secureStore.setKeys(encryptionKey, symmetricKey, newEncryptedVaultKey);
            }

            return data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }
    
};
