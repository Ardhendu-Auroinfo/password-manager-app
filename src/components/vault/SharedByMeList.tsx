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
                            <div className="flex items-center min-w-0 w-2/4">
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

                            <div className="flex flex-col items-center justify-center w-2/4">
                                <p className="text-sm text-gray-500 mb-2">Shared with:</p>
                                <span className="px-3 py-1 text-sm font-medium  text-gray-800">
                                    {shared.shared_with_email}
                                </span>
                            </div>

                            <div className="flex flex-col items-center justify-center w-1/4">
                                <p className="text-sm text-gray-500 mb-2">Access level:</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${shared.permission_level === 'admin'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : shared.permission_level === 'write'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {shared.permission_level.charAt(0).toUpperCase() + shared.permission_level.slice(1)}
                                </span>
                                {shared.expires_at && (
                                    <span className="text-xs text-gray-500 mt-1">
                                        Expires: {new Date(shared.expires_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-4 w-1/4 justify-end">
                                <button
                                    onClick={() => handleEdit(shared.entry_id)}
                                    className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                    title="Edit item"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleCopyPassword(shared.encrypted_password)}
                                    className="text-gray-400 hover:text-grey-500 transform hover:scale-110 transition duration-300 ease-in-out"
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