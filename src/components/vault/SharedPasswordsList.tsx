import React, { useEffect, useState } from 'react';
import { ShareService } from '../../services/share.service';
import { ISharedPassword } from '../../types/share.types';
import { ClipboardIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { decryptData, decryptKeyData } from '../../utils/encryption';
import { VaultService } from '../../services/vault.service';
import EditPasswordModal from './EditPasswordModal';
import { IDecryptedPasswordEntry } from '../../types/vault.types';

const SharedPasswordsList: React.FC = () => {
    const [sharedPasswords, setSharedPasswords] = useState<ISharedPassword[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<IDecryptedPasswordEntry | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [permissionLevel, setPermissionLevel] = useState<string>('');
    const [sharedKey, setSharedKey] = useState<string>('');

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

    const handleCopyPassword = async (encryptedPassword: { type: 'Buffer'; data: number[] }, sharedKey: string) => {
        try {
            const passwordBuffer = new TextDecoder().decode(new Uint8Array(encryptedPassword.data));
            const vaultKey = decryptKeyData(sharedKey);
            const decryptedPassword = decryptData(passwordBuffer, vaultKey);
            await navigator.clipboard.writeText(decryptedPassword);
            toast.success('Password copied to clipboard');
        } catch (err) {
            console.error('Failed to copy password:', err);
            toast.error('Failed to copy password');
        }
    };

    const handleRevokeAccess = async (id: string) => {
        try {
            if (window.confirm(`Are you sure you want to revoke access?`)) {
                await ShareService.revokeAccess(id);
                toast.success('Access revoked successfully');
                loadSharedPasswords();
            }
        } catch (error) {
            toast.error('Failed to revoke access');
        }
    };
    const handleEdit = async (entryId: string, shared: ISharedPassword) => {
        try {
            setPermissionLevel(shared.permission_level);
            const entry: IDecryptedPasswordEntry = {
                id: shared.entry_id,
                title: shared.title,
                username: shared.encrypted_username ? decryptData(
                    new TextDecoder().decode(new Uint8Array(shared.encrypted_username.data)),
                    decryptKeyData(shared.shared_key)
                ) : '',
                password: shared.encrypted_password ? decryptData(
                    new TextDecoder().decode(new Uint8Array(shared.encrypted_password.data)),
                    decryptKeyData(shared.shared_key)
                ) : '',
                website_url: shared.website_url || '',
                notes: shared.encrypted_notes ? decryptData(
                    new TextDecoder().decode(new Uint8Array(shared.encrypted_notes.data)),
                    decryptKeyData(shared.shared_key)
                ) : '',
                vault_id: shared.shared_key,
                category: shared.category || '',
                favorite: shared.favorite,
                password_strength: shared.password_strength || 0,
                created_at: shared.created_at,
                updated_at: shared.updated_at,

            };
            setSelectedEntry(entry);
            setIsEditModalOpen(true);
        } catch (err) {
            console.error('Failed to prepare entry for editing:', err);
            toast.error('Failed to prepare entry for editing');
        }
    };


    const getFaviconUrl = (websiteUrl: string) => {
        const url = new URL(websiteUrl);
        return `https://www.google.com/s2/favicons?domain=${url.hostname}`;
    };

    const getExpiryStatus = (expiryDate: Date | null | undefined) => {
        if (!expiryDate) return null;
        
        const now = new Date();
        const expiry = new Date(expiryDate);
        
        if (expiry <= now) {
            return { status: 'Expired', className: 'text-red-600' };
        }
        
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        
        let timeLeft;
        if (diffDays > 1) {
            timeLeft = `${diffDays} days`;
        } else if (diffHours > 1) {
            timeLeft = `${diffHours} hours`;
        } else {
            timeLeft = 'Less than 1 hour';
        }
        
        return { 
            status: 'Active', 
            timeLeft,
            className: 'text-green-600'
        };
    };

    const isShareExpired = (expiryDate: Date | null | undefined): boolean => {
        if (!expiryDate) return false;
        const now = new Date();
        const expiry = new Date(expiryDate);
        return expiry <= now;
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
                        <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-50">
                            {/* First Column - Icon, Title, URL */}
                            <div className="flex items-center min-w-0 w-2/5">
                                <div className="flex-shrink-0">
                                    {shared.website_url && (
                                        <div className="flex-shrink-0 w-8 h-8">
                                            <img
                                                src={getFaviconUrl(shared.website_url)}
                                                alt=""
                                                className="w-8 h-8 rounded-full bg-gray-100"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/password-manager.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <p className="font-medium text-gray-900">{shared.title}</p>
                                    {shared.website_url && (
                                        <p className="text-sm text-gray-500">{shared.website_url}</p>
                                    )}
                                </div>
                            </div>

                            {/* Second Column - Shared By Email */}
                            <div className="flex flex-col items-center justify-center w-2/5">
                                <p className="text-sm text-gray-500 mb-2">Shared by:</p>
                                <span className="px-3 py-1 text-sm font-medium  text-gray-800">
                                    {shared.shared_by_email}
                                </span>
                            </div>

                            {/* Third Column - Access Level */}
                            <div className="flex flex-col items-center justify-center w-1/5">
                                <p className="text-sm text-gray-500 mb-2">Access level:</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${shared.permission_level === 'admin'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : shared.permission_level === 'write'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {shared?.permission_level?.charAt(0).toUpperCase() + shared?.permission_level?.slice(1)}
                                </span>
                                
                            </div>

                            {/* Fourth Column - Expiry */}
                            <div className="flex items-center w-1/5">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    {shared.expires_at ? (
                                        <>
                                            <span className={`text-sm font-medium ${
                                                getExpiryStatus(shared.expires_at)?.className
                                            }`}>
                                                {getExpiryStatus(shared.expires_at)?.status}
                                            </span>
                                            {getExpiryStatus(shared.expires_at)?.status === 'Active' && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Expires in: {getExpiryStatus(shared.expires_at)?.timeLeft}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-600">
                                            Never expires
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Fifth Column - Actions */}
                            {!isShareExpired(shared?.expires_at) && (
                                <div className="flex items-center space-x-4 w-1/5 justify-end">
                                    {shared.permission_level === 'write' && (
                                        <button
                                            onClick={() => handleEdit(shared.entry_id, shared)}
                                            className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                            title="Edit item"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    {shared.permission_level === 'read' && (
                                        <button
                                            onClick={() => handleEdit(shared.entry_id, shared)}
                                            className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                            title="Edit item"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleCopyPassword(shared.encrypted_password, shared.shared_key)}
                                        className="text-gray-400 hover:text-grey-500 transform hover:scale-110 transition duration-300 ease-in-out"
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
                            )}
                        </div>
                    </li>
                ))}
                {sharedPasswords.length === 0 && (
                    <li className="px-4 py-8 text-center text-gray-500">
                        No shared passwords found
                    </li>
                )}
            </ul>
            {selectedEntry && (
                <EditPasswordModal
                    entry={selectedEntry}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedEntry(null);
                    }}
                    isSharedPassword={true}
                    permissionLevel={permissionLevel}
                    onSuccessfulUpdate={loadSharedPasswords}
                />
            )}
        </div>
    );
};

export default SharedPasswordsList;