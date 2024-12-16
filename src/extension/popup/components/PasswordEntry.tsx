import React from 'react';
import { IDecryptedPasswordEntry } from '../../../types/vault.types';

interface PasswordEntryProps {
    entry: IDecryptedPasswordEntry;
    onEdit: (entry: IDecryptedPasswordEntry) => void;
    onDelete: (id: string) => void;
    isDropdownOpen: boolean;
    onToggleDropdown: (id: string) => void;
}

const PasswordEntry: React.FC<PasswordEntryProps> = ({
    entry,
    onEdit,
    onDelete,
    isDropdownOpen,
    onToggleDropdown,
}) => {
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    const getFaviconUrl = (websiteUrl: string): string => {
        try {
            const url = new URL(websiteUrl);
            return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
        } catch {
            return '/default-favicon.png';
        }
    };

    const handleCopyToClipboard = async (text: string, type: 'username' | 'password') => {
        try {
            await navigator.clipboard.writeText(text);
            // You can add a toast notification here
            console.log(`${type} copied to clipboard`);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <div className="relative bg-white border rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-3">
                <div className="flex items-center space-x-3">
                    {/* Favicon */}
                    {entry.website_url && (
                        <div className="flex-shrink-0 w-8 h-8">
                            <img
                                src={getFaviconUrl(entry.website_url)}
                                alt=""
                                className="w-8 h-8 rounded-full bg-gray-100"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = '/default-favicon.png';
                                    img.onerror = null;
                                }}
                            />
                        </div>
                    )}

                    {/* Entry Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                {truncateText(entry.title, 25)}
                            </h4>
                            {entry.favorite && (
                                <svg
                                    className="w-4 h-4 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    />
                                </svg>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                            {truncateText(entry.username, 30)}
                        </p>
                    </div>

                    {/* Actions Button */}
                    <div className="flex-shrink-0 relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDropdown(entry.id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="py-1" role="menu">
                                    <button
                                        onClick={() => handleCopyToClipboard(entry.username, 'username')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy Username
                                    </button>
                                    <button
                                        onClick={() => handleCopyToClipboard(entry.password, 'password')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        Copy Password
                                    </button>
                                    <button
                                        onClick={() => onEdit(entry)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                    {entry.website_url && (
                                        <button
                                            onClick={() => chrome.tabs.create({ url: entry.website_url })}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Open Website
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(entry.id)}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordEntry;