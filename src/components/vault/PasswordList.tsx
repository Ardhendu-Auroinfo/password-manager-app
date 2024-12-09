import React from 'react';
import { KeyIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useVault } from '../../contexts/VaultContext';
import { IDecryptedPasswordEntry } from '../../types/vault.types';

const PasswordList: React.FC = () => {
    const { entries, loading, error, deleteEntry } = useVault();

    const handleCopyPassword = async (password: string) => {
        try {
            await navigator.clipboard.writeText(password);
            // TODO: Add success notification
        } catch (err) {
            console.error('Failed to copy password:', err);
            // TODO: Add error notification
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">Error loading passwords: {error}</p>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-8">
                <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No passwords</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new password entry.</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {entries.map((entry: IDecryptedPasswordEntry) => (
                    <li key={entry.id}>
                        <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center min-w-0 flex-1">
                                <div className="flex-shrink-0">
                                    <KeyIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="font-medium text-gray-900">{entry.title}</p>
                                    <p className="text-sm text-gray-500">{entry.username}</p>
                                    {entry.website_url && (
                                        <p className="text-sm text-gray-500">{entry.website_url}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleCopyPassword(entry.password)}
                                    className="text-gray-400 hover:text-gray-500"
                                    title="Copy password"
                                >
                                    <EyeIcon className="h-5 w-5" />
                                </button>
                                
                                <button
                                    onClick={() => {/* TODO: Implement edit */}}
                                    className="text-gray-400 hover:text-gray-500"
                                    title="Edit entry"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this password?')) {
                                            deleteEntry(entry.id);
                                        }
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                    title="Delete entry"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordList;