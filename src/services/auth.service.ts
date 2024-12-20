import { ILoginCredentials, IRegisterCredentials, IAuthResponse, IPasswordEntry, IDecryptedPasswordEntry, ICreatePasswordEntry } from '../types';
import { decryptData, decryptVaultKey, deriveKeys, encryptData, encryptVaultKey } from '../utils/encryption';
import { secureStore } from '../utils/secureStore';
import { VaultService } from './vault.service';

const API_URL = process.env.REACT_APP_API_URL;
console.log("API_URL", API_URL);

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

            // Send only derived auth key to server, never the master password
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    authKey: authKey,
                    encryptedVaultKey: encryptedVaultKey,
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
    decryptEntry(entry: IPasswordEntry, vaultKey: string): IDecryptedPasswordEntry {
        
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

            // Decode encrypted data with error handling for each field
            try {
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
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt password entry');
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
            // Generate new keys
            const { authKey, encryptionKey, symmetricKey: newSymmetricKey } = deriveKeys(newPassword, email);

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
            // Decrypt vault key
            console.log('Encrypted Vault Key:', encryptedVaultKey);

            const vaultKey = decryptVaultKey(encryptedVaultKey, encryptionKey);
            secureStore.setKeys(
                encryptionKey,
                newSymmetricKey,
                vaultKey
            );
           

            const entries = await response.json();

            // // Re-encrypt entries with new symmetric key
            // const reEncryptedEntries = entries.map((entry: any) => {
            //     // Convert Buffer data to string before re-encrypting
            //     const username = Buffer.from(entry.encrypted_username.data).toString();
            //     const password = Buffer.from(entry.encrypted_password.data).toString();
            //     const notes = entry.encrypted_notes ? 
            //         Buffer.from(entry.encrypted_notes.data).toString() : null;

            //     return {
            //         id: entry.id,
            //         vault_id: entry.vault_id,
            //         encrypted_username: encryptData(username, newSymmetricKey),
            //         encrypted_password: encryptData(password, newSymmetricKey),
            //         encrypted_notes: notes ? encryptData(notes, newSymmetricKey) : null
            //     };
            // });
            // Decrypt entries using decryptEntry method
            console.log("entries", entries);
        const decryptedEntries = entries.map((entry: IPasswordEntry) => {
            return this.decryptEntry(entry, vaultKey);
        });

        // // Re-encrypt entries with new symmetric key using encryptEntry method
            const reEncryptedEntries = decryptedEntries.map((entry: IDecryptedPasswordEntry) => {
                return this.encryptEntry(entry, vaultKey);
            });

            // Send reset request
            const resetResponse = await fetch(`${API_URL}/users/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`
                },
                body: JSON.stringify({
                    authKey,
                    encryptedVaultKey: encryptVaultKey(newSymmetricKey, encryptionKey),
                    reEncryptedEntries,
                    email
                })
            });

            if (!resetResponse.ok) {
                const errorData = await resetResponse.json();
                throw new Error(errorData.message || 'Password reset failed');
            }

            const data = await resetResponse.json();
            
            if (data.success) {
                // Store the new keys
                secureStore.setKeys(encryptionKey, newSymmetricKey, newSymmetricKey);
            }

            return data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },
    
};
