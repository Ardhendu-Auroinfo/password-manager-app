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
                            {location.pathname === '/vault' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-3 h-6 w-6">
                            <path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 0 0-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 0 0-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 0 0 .75-.75v-1.5h1.5A.75.75 0 0 0 9 19.5V18h1.5a.75.75 0 0 0 .53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1 0 15.75 1.5Zm0 3a.75.75 0 0 0 0 1.5A2.25 2.25 0 0 1 18 8.25a.75.75 0 0 0 1.5 0 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
                          </svg>
                          
                          
                            :
                            <KeyIcon className="mr-3 h-6 w-6 " />
                        }
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
                            {location.pathname === '/favorites' ? 
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-3 h-6 w-6 text-yellow-400">
                             <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                           </svg>
                           
                         :
                         <StarIcon className="mr-3 h-6 w-6" />
                        }
                            Favorites
                        </Link>
                        <Link
                            to="/sharing-center"
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-gray-900 ${
                                location.pathname === '/sharing-center'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600'
                            }`}
                        >
                            {location.pathname === '/sharing-center' ? 
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-3 h-6 w-6">
                                    <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                                </svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-3 h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" />
                                </svg>
                            }
                            Sharing Center
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
