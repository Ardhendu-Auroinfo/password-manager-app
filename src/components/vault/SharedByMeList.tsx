import React, { useEffect, useState } from 'react';
import { ShareService } from '../../services/share.service';
import { ISharedPassword } from '../../types/share.types';
import { ArrowTopRightOnSquareIcon, ClipboardIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { decryptData } from '../../utils/encryption';
import { secureStore } from '../../utils/secureStore';
import { IDecryptedPasswordEntry } from '../../types/vault.types';
import { VaultService } from '../../services/vault.service';
import EditPasswordModal from './EditPasswordModal';

const SharedByMeList: React.FC = () => {
    const [sharedPasswords, setSharedPasswords] = useState<ISharedPassword[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<IDecryptedPasswordEntry | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        loadSharedPasswords();
    }, []);

    const loadSharedPasswords = async () => {
        try {
            const passwords = await ShareService.getSharedByMePasswords();
            setSharedPasswords(passwords);
        } catch (error) {
            toast.error('Failed to load shared passwords');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = async (encryptedPassword: { type: 'Buffer'; data: number[] }) => {
        try {
            const passwordBuffer = new TextDecoder().decode(new Uint8Array(encryptedPassword.data));
            const vaultKey = secureStore.getVaultKey();
            const decryptedPassword = decryptData(passwordBuffer, vaultKey);

            await navigator.clipboard.writeText(decryptedPassword);
            toast.success('Password copied to clipboard');
        } catch (err) {
            console.error('Failed to copy password:', err);
            toast.error('Failed to copy password');
        }
    };

    const handleRevokeAccess = async (id: string, sharedWithEmail: string) => {
        try {
            if (window.confirm(`Are you sure you want to revoke access to ${sharedWithEmail}? They'll lose access to this item`)) {
                await ShareService.revokeAccess(id);
                toast.success('Access revoked successfully');
                loadSharedPasswords();
            }
        } catch (error) {
            toast.error('Failed to revoke access');
        }
    };
    const getFaviconUrl = (websiteUrl: string): string => {
        try {
            const url = new URL(websiteUrl);
            return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
        } catch {
            return '/password-manager.png';
        }
    };
    const handleEdit = async (entryId: string) => {
        try {
            const entry = await VaultService.getEntryById(entryId);
            setSelectedEntry(entry);
            setIsEditModalOpen(true);
        } catch (err) {
            console.error('Failed to fetch entry:', err);
            toast.error('Failed to fetch entry');
        }
    };
    const handleWebsiteLaunch = async (entry: IDecryptedPasswordEntry) => {
        try {
            // Copy credentials to clipboard
            const credentials = `Username: ${entry.username}\nPassword: ${entry.password}`;
            await navigator.clipboard.writeText(credentials);

            // Open website in new tab
            if (entry.website_url) {
                window.open(entry.website_url, '_blank');
                toast.success('Credentials copied and website opened');
            } else {
                toast.error('No website URL provided');
            }
        } catch (err) {
            console.error('Failed to launch website:', err);
            toast.error('Failed to launch website');
        }
    };

    const handlePermissionChange = async (shareId: string, newPermission: string) => {
        try {
            if(window.confirm(`Are you sure you want to update the permission level to ${newPermission}?`)) {
                await ShareService.updatePermissionLevel(shareId, newPermission);
                toast.success('Permission updated successfully');
                loadSharedPasswords();
            }
        } catch (error) {
            console.error('Failed to update permission:', error);
            toast.error('Failed to update permission');
        }
    };

    const getExpiryValue = (expiryDate: Date | null): string => {
        if (!expiryDate) return 'never';
        
        const now = new Date();
        const expiry = new Date(expiryDate);
        
        if (expiry <= now) {
            return 'expired';
        }
        
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) return '1';
        if (diffDays <= 7) return '7';
        if (diffDays <= 30) return '30';
        if (diffDays <= 90) return '90';
        return '90';
    };

    const handleExpiryChange = async (shareId: string, value: string) => {
        try {
            let expiresAt: Date | null = null;
            
            if (value !== 'never') {
                const days = parseInt(value);
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + days);
            }

            if (window.confirm(`Are you sure you want to update the expiry?`)) {
                await ShareService.updateExpiry(shareId, expiresAt);
                toast.success('Expiry updated successfully');
                loadSharedPasswords();
            }
        } catch (error) {
            console.error('Failed to update expiry:', error);
            toast.error('Failed to update expiry');
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
                        <div className="flex items-center justify-between px-4 py-2 sm:px-6 hover:bg-gray-50">
                            {/* Title and Website Section */}
                            <div className="flex items-center w-2/5">
                                {shared.website_url && (
                                    <img
                                        src={getFaviconUrl(shared.website_url)}
                                        alt=""
                                        className="w-8 h-8 rounded-full bg-gray-100 mr-3"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/password-manager.png';
                                        }}
                                    />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{shared.title}</p>
                                    {shared.website_url && (
                                        <p className="text-sm text-gray-500  max-w-[150px]">{shared.website_url}</p>
                                    )}
                                </div>
                            </div>

                            {/* Shared With Section */}
                            <div className="flex items-center w-2/5">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Shared with</p>
                                    <span className="text-sm font-medium text-gray-800">
                                        {shared.shared_with_email}
                                    </span>
                                </div>
                            </div>

                            {/* Permission Level Section */}
                            <div className="flex items-center w-1/5">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Access level</p>
                                    <select
                                        value={shared.permission_level}
                                        onChange={(e) => handlePermissionChange(shared.id, e.target.value)}
                                        className={`px-3 py-1 cursor-pointer rounded-full text-sm font-medium border-gray-300
                                            ${shared.permission_level === 'write' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        <option value="read">Read</option>
                                        <option value="write">Write</option>
                                    </select>
                                </div>
                            </div>

                            {/* Expiry Section */}
                            <div className="flex items-center w-1/5">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Expires in</p>
                                    <select
                                        value={getExpiryValue(shared.expires_at ? new Date(shared.expires_at) : null)}
                                        onChange={(e) => handleExpiryChange(shared.id, e.target.value)}
                                        className={`px-3 py-1 cursor-pointer rounded text-sm font-medium border-gray-300 
                                            `}
                                            
                                    >
                                        <option value="never">Never</option>
                                        <option value="1">24 hours</option>
                                        <option value="7">7 days</option>
                                        <option value="30">30 days</option>
                                        <option value="90">90 days</option>
                                    </select>
                                    {shared.expires_at && (
                                        <p className={`text-xs mt-1 ${
                                            getExpiryValue(shared.expires_at) === 'expired' 
                                            ? 'text-red-600' 
                                            : 'text-gray-500'
                                        }`}>
                                            {getExpiryValue(shared.expires_at) === 'expired' 
                                                ? `Expired at: ${new Date(shared.expires_at).toLocaleDateString()}`
                                                : `Expires: ${new Date(shared.expires_at).toLocaleDateString()}`
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="flex items-center space-x-3 w-1/5 justify-end">
                                <button
                                    onClick={() => handleEdit(shared.entry_id)}
                                    className="text-gray-400 hover:text-blue-500"
                                    title="Edit item"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleCopyPassword(shared.encrypted_password)}
                                    className="text-gray-400 hover:text-gray-500"
                                    title="Copy password"
                                >
                                    <ClipboardIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleRevokeAccess(shared.id, shared.shared_with_email)}
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
            {selectedEntry && (
                <EditPasswordModal
                    entry={selectedEntry}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedEntry(null);
                    }}
                />
            )}
        </div>
        
    );
};

export default SharedByMeList;