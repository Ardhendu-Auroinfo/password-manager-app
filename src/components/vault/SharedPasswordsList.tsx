import React, { useEffect, useState } from 'react';
import { ShareService } from '../../services/share.service';
import { ISharedPassword } from '../../types/share.types';
import { ClipboardIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { decryptData } from '../../utils/encryption';
import { secureStore } from '../../utils/secureStore';

const SharedPasswordsList: React.FC = () => {
    const [sharedPasswords, setSharedPasswords] = useState<ISharedPassword[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSharedPasswords();
    }, []);

    const loadSharedPasswords = async () => {
        try {
            const passwords = await ShareService.getSharedPasswords();
            setSharedPasswords(passwords);
        } catch (error) {
            toast.error('Failed to load shared passwords');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = async (encryptedPassword: { type: 'Buffer'; data: number[] }) => {
        try {
            // Convert Buffer data to string
            const passwordBuffer = new TextDecoder().decode(new Uint8Array(encryptedPassword.data));
            
            // Get vault key from secure store
            const vaultKey = secureStore.getVaultKey();
            
            // Decrypt the password
            const decryptedPassword = decryptData(passwordBuffer, vaultKey);
            
            // Copy to clipboard
            await navigator.clipboard.writeText(decryptedPassword);
            toast.success('Password copied to clipboard');
        } catch (err) {
            console.error('Failed to copy password:', err);
            toast.error('Failed to copy password');
        }
    };

    const handleRevokeAccess = async (id: string) => {
        try {
            await ShareService.revokeAccess(id);
            toast.success('Access revoked successfully');
            loadSharedPasswords();
        } catch (error) {
            toast.error('Failed to revoke access');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {sharedPasswords.map((shared) => (
                    <li key={shared.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium">{shared.title}</h3>
                                <p className="text-sm text-gray-500">
                                    Shared by: {shared.shared_by_email}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Access level: {shared.permission_level}
                                </p>
                                {shared.expires_at && (
                                    <p className="text-xs text-gray-400">
                                        Expires: {new Date(shared.expires_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleCopyPassword(shared.encrypted_password)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Copy password"
                                >
                                    <ClipboardIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleRevokeAccess(shared.id)}
                                    className="text-gray-400 hover:text-red-600"
                                    title="Revoke access"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
                {sharedPasswords.length === 0 && (
                    <li className="px-4 py-8 text-center text-gray-500">
                        No shared passwords found
                    </li>
                )}
            </ul>
        </div>
    );
};

export default SharedPasswordsList;