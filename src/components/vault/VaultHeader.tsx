import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import PasswordModal from './PasswordModal';

const VaultHeader: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        // TODO: Refrecsh password list
        console.log('Password added successfully');
    };

    return (
        <>
            <header className="w-full">
                <div className="relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm flex">
                    <div className="flex-1 flex justify-between px-4 sm:px-6">
                        {/* Search */}
                        <div className="flex-1 flex">
                            <div className="w-full flex md:ml-0">
                                <label htmlFor="search" className="sr-only">Search</label>
                                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="search"
                                        className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm"
                                        placeholder="Search"
                                        type="search"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-2 flex items-center space-x-4">
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                type="button"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Password
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <PasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
};

export default VaultHeader;
