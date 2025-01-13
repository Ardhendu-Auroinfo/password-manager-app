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
    category?: string;
    encrypted_password: {
        type: 'Buffer';
        data: number[];
    };
    shared_key: string;
}

export interface ISharePasswordRequest {
    entryId: string;
    sharedWithEmail: string;
    permissionLevel: 'read' | 'write' | 'admin';
    expiresAt?: Date;
    sharedKey?: string;
}