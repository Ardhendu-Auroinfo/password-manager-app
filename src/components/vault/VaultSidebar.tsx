import React from 'react';
import { FolderIcon, StarIcon, KeyIcon } from '@heroicons/react/24/outline';

const VaultSidebar: React.FC = () => {
    return (
        <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
                <div className="h-0 flex-1 flex flex-col">
                    <div className="px-4 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">My Vault</h2>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                            <KeyIcon className="mr-3 h-6 w-6" />
                            All Items
                        </a>
                        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                            <StarIcon className="mr-3 h-6 w-6" />
                            Favorites
                        </a>
                        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                            <FolderIcon className="mr-3 h-6 w-6" />
                            Categories
                        </a>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default VaultSidebar;
