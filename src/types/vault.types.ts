export interface IVault {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface IPasswordEntry {
    id: string;
    vault_id: string;
    title: string;
    encrypted_username: string;
    encrypted_password: string;
    encrypted_notes?: string;
    website_url?: string;
    category: string;
    favorite: boolean;
    last_used?: Date;
    password_strength: number;
    created_at: Date;
    updated_at: Date;
}

// For frontend use (decrypted data)
export interface IDecryptedPasswordEntry {
    id: string;
    vault_id: string;
    title: string;
    username: string;
    password: string;
    notes?: string;
    website_url?: string;
    category: string;
    favorite: boolean;
    last_used?: Date;
    password_strength: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICreatePasswordEntry {
    title: string;
    username: string;
    password: string;
    notes?: string;
    website_url?: string;
    category?: string;
    favorite?: boolean;
}

export interface IPasswordHistory {
    id: string;
    entry_id: string;
    password: string;  // Will be encrypted/decrypted
    changed_at: Date;
}

export interface ISession {
    id: string;
    device_info: {
        browser?: string;
        os?: string;
        device?: string;
    };
    ip_address: string;
    last_used: Date;
    expires_at: Date;
}