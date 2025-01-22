import React, { useEffect, useState } from 'react';
import { KeyIcon, ClipboardIcon, PencilIcon, TrashIcon, ArrowTopRightOnSquareIcon, ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useVault } from '../../contexts/VaultContext';
import { IDecryptedPasswordEntry } from '../../types/vault.types';
import EditPasswordModal from './EditPasswordModal';
import { VaultService } from '../../services/vault.service';
import { toast } from 'react-hot-toast';
import SharePasswordModal from './SharePasswordModal';
import { useLocation } from 'react-router-dom';
interface PasswordListProps {
    entries?: IDecryptedPasswordEntry[];
    categoryId?: string;
    loading?: boolean;
    error?: string | null;
    showCategoryBadge?: boolean;
}

const PasswordList: React.FC<PasswordListProps> = ({ entries, categoryId, loading, error, showCategoryBadge }) => {
    const { deleteEntry, refreshEntries } = useVault();
    const [selectedEntry, setSelectedEntry] = useState<IDecryptedPasswordEntry | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareEntry, setShareEntry] = useState<IDecryptedPasswordEntry | null>(null);
    const location = useLocation();

    const getFaviconUrl = (websiteUrl: string): string => {
        try {
            const url = new URL(websiteUrl);
            return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
        } catch {
            return '/password-manager.png';
        }
    };

    const handleCopyPassword = async (password: string) => {
        try {
            await navigator.clipboard.writeText(password);
            toast.success('Password copied to clipboard');
        } catch (err) {
            console.error('Failed to copy password:', err);
            toast.error('Failed to copy password');
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

    const handleShare = (entry: IDecryptedPasswordEntry) => {
        setShareEntry(entry);
        setIsShareModalOpen(true);
    };

    const handleRemoveFromCategory = async (entryId: string) => {
        try {
            if (window.confirm('Are you sure you want to remove this password from its category?')) {
                await VaultService.removeCategoryFromEntry(entryId);
                await refreshEntries(); 
                toast.success('Password removed from category');
            }
        } catch (error) {
            toast.error('Failed to remove password from category');
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

    if (entries?.length === 0) {
        return (
            <div className="text-center py-8">
                <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No passwords</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new password entry.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {entries?.map((entry: IDecryptedPasswordEntry) => (
                        <li key={entry.id}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                        {entry.website_url && (
                                            <div className="flex-shrink-0 w-8 h-8">
                                                <img
                                                    src={getFaviconUrl(entry.website_url)}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full bg-gray-100"
                                                    onError={(e) => {
                                                        console.warn(
                                                            'Favicon could not be loaded. Falling back to default image.'
                                                        );
                                                        (e.target as HTMLImageElement).src = '/password-manager.png';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {/* <KeyIcon className="h-6 w-6 text-gray-400" /> */}
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
                                    {entry.favorite && (
                                        <svg
                                            className="w-6 h-6 text-yellow-400 hover:text-yellow-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                            />
                                        </svg>
                                    )}
                                    {entry.website_url && (
                                        <button
                                            onClick={() => handleWebsiteLaunch(entry)}
                                            className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                            title="Launch website"
                                        >
                                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleCopyPassword(entry.password)}
                                        className="text-gray-400 hover:text-grey-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                        title="Copy password"
                                    >
                                        <ClipboardIcon className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => handleEdit(entry.id)}
                                        className="text-gray-400 hover:text-blue-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                        title="Edit entry"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this password?')) {
                                                deleteEntry(entry.id);
                                                toast.success('Password deleted successfully');
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                        title="Delete entry"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => handleShare(entry)}
                                        className="text-gray-400 hover:text-green-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                        title="Share password"
                                    >
                                        <ShareIcon className="h-5 w-5" />
                                    </button>

                                    {entry.category_id && location.pathname === '/categories' && (
                                        <button
                                            onClick={() => handleRemoveFromCategory(entry.id)}
                                            className="text-gray-400 hover:text-red-500 transform hover:scale-110 transition duration-300 ease-in-out"
                                            title="Remove from category"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                    )}
                                </div>

                            </div>
                        </li>
                    ))}
                </ul>
            </div>

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

            {shareEntry && (
                <SharePasswordModal
                    isOpen={isShareModalOpen}
                    onClose={() => {
                        setIsShareModalOpen(false);
                        setShareEntry(null);
                    }}
                    entryId={shareEntry.id}
                    entryTitle={shareEntry.title}
                />
            )}
        </>
    );
};

export default PasswordList;