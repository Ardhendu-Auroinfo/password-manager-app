import React from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';

const PasswordList: React.FC = () => {
    // Temporary mock data
    const passwords = [
        { id: 1, title: 'Gmail', username: 'user@gmail.com', website: 'gmail.com' },
        { id: 2, title: 'GitHub', username: 'user', website: 'github.com' },
    ];

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
                {passwords.map((password) => (
                    <li key={password.id}>
                        <a href="#" className="block hover:bg-gray-50">
                            <div className="px-4 py-4 flex items-center sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <KeyIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium text-gray-900">{password.title}</p>
                                            <p className="text-sm text-gray-500">{password.username}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex-shrink-0 sm:mt-0">
                                        <p className="text-sm text-gray-500">{password.website}</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordList;