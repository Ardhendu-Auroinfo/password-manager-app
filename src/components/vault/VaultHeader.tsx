import React, { useState, useRef } from 'react';
import { MagnifyingGlassIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import PasswordModal from './PasswordModal';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { toast } from 'react-hot-toast';

const VaultHeader: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useOnClickOutside(profileRef, () => setIsProfileOpen(false));

    const handleLogout = () => {
        try {
            logout();
            toast.success('Logged out successfully');
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        toast.success('Password added successfully');
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

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2"
                                >
                                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                    <span className="ml-2 text-gray-700 hidden sm:block">
                                        {user?.email}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                                        <div className="px-4 py-3">
                                            <p className="text-sm">Signed in as</p>
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    navigate('/account-settings');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Account Settings
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
