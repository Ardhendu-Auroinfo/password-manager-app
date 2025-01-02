export interface IVault {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface EncryptedBuffer {
    type: 'Buffer';
    data: number[];
}

export interface IPasswordEntry {
    id: string;
    vault_id: string;
    title: string;
    encrypted_username: {
        type: 'Buffer';
        data: number[];
    };
    encrypted_password: {
        type: 'Buffer';
        data: number[];
    };
    encrypted_notes?: {
        type: 'Buffer';
        data: number[];
    };
    website_url?: string;
    category?: string;
    favorite: boolean;
    last_used?: string;
    password_strength?: number;
    created_at: string;
    updated_at: string;
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