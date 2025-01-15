import { ISharedPassword, ISharePasswordRequest } from '../types/share.types';
import { config } from '../extension/config';
import { store } from '../store';
import { secureStore } from '../utils/secureStore';
import { encryptKeyData } from '../utils/encryption';

const API_URL = config.API_URL;

export class ShareService {
    private static getToken(): string {
        const token = store.getState().auth.token;
        if (!token) {
            throw new Error('No authentication token found');
        }
        return token;
    }

    static async sharePassword(request: ISharePasswordRequest): Promise<void> {

        const vaultKey = secureStore.getVaultKey();
        const sharedKey = encryptKeyData(vaultKey);

        const response = await fetch(`${API_URL}/vault/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify({
                ...request,
                sharedKey
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to share password');
        }
    }

    static async getSharedPasswords(): Promise<ISharedPassword[]> {
        const response = await fetch(`${API_URL}/vault/shared-passwords`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shared passwords');
        }

        return response.json();
    }

    static async getSharedByMePasswords(): Promise<ISharedPassword[]> {
        const response = await fetch(`${API_URL}/vault/shared-by-me`, {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shared by me passwords');
        }

        return response.json();
    }

    static async revokeAccess(shareId: string): Promise<void> {
        const response = await fetch(`${API_URL}/vault/share/${shareId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to revoke access');
        }
    }

    static async updatePermissionLevel(shareId: string, permissionLevel: string): Promise<void> {
        console.log('shareId', shareId);
        console.log('permissionLevel', permissionLevel);
        const response = await fetch(`${API_URL}/vault/share/${shareId}/permission`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify({ permission_level: permissionLevel })
        });

        if (!response.ok) {
            throw new Error('Failed to update permission level');
        }
    }

}
