export interface ISharedPassword {
    id: string;
    entry_id: string;
    shared_by: string;
    shared_by_email: string;
    shared_with: string;
    shared_with_email: string;
    permission_level: 'read' | 'write' | 'admin';
    expires_at?: Date;
    title: string;
    website_url?: string;
    category_id?: string;
    encrypted_password: {
        type: 'Buffer';
        data: number[];
    };
    shared_key: string;
    encrypted_username: {
        type: 'Buffer';
        data: number[];
    };
    encrypted_notes: {
        type: 'Buffer';
        data: number[];
    };
    favorite: boolean;
    password_strength: number;
    created_at: Date;
    updated_at: Date;
}

export interface ISharePasswordRequest {
    entryId: string;
    sharedWithEmail: string;
    permissionLevel: 'read' | 'write' | 'admin';
    expiresAt?: Date;
    sharedKey?: string;
}