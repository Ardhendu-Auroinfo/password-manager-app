import React, { useEffect, useState } from 'react';
import { ShareService } from '../../services/share.service';
import { ISharedPassword } from '../../types/share.types';
import { ClipboardIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { decryptData, decryptKeyData } from '../../utils/encryption';

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

    const getFaviconUrl = (websiteUrl: string) => {
        const url = new URL(websiteUrl);
        return `https://www.google.com/s2/favicons?domain=${url.hostname}`;
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

                            {/* Second Column - Shared By Email */}
                            <div className="flex flex-col items-center justify-center w-2/4">
                                <p className="text-sm text-gray-500 mb-2">Shared by:</p>
                                <span className="px-3 py-1 text-sm font-medium  text-gray-800">
                                    {shared.shared_by_email}
                                </span>
                            </div>

                            {/* Third Column - Access Level */}
                            <div className="flex flex-col items-center justify-center w-1/4">
                                <p className="text-sm text-gray-500 mb-2">Access level:</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    shared.permission_level === 'admin' 
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

                            {/* Fourth Column - Actions */}
                            <div className="flex items-center space-x-4 w-1/4 justify-end">
                                {shared.permission_level === 'admin' && (
                                    <svg
                                        className="w-6 h-6 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
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