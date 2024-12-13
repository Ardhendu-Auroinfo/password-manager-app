import React from 'react';
import { FolderIcon, StarIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

const VaultSidebar: React.FC = () => {
    const location = useLocation();

    return (
        <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
                <div className="h-0 flex-1 flex flex-col">
                    <div className="px-4 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">My Vault</h2>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        <Link
                            to="/vault"
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-gray-900 ${
                                location.pathname === '/vault'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600'
                            }`}
                        >
                            <KeyIcon className="mr-3 h-6 w-6" />
                            All Items
                        </Link>
                        <Link
                            to="/favorites"
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-gray-900 ${
                                location.pathname === '/favorites'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600'
                            }`}
                        >
                            <StarIcon className="mr-3 h-6 w-6" />
                            Favorites
                        </Link>
                        
                        
                        {/* <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                            <FolderIcon className="mr-3 h-6 w-6" />
                            Categories
                        </a> */}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default VaultSidebar;
