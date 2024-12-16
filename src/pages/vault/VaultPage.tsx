import React, { useEffect } from 'react';
import VaultSidebar from '../../components/vault/VaultSidebar';
import VaultHeader from '../../components/vault/VaultHeader';
import PasswordList from '../../components/vault/PasswordList';
import { useVault } from '../../contexts/VaultContext';

const VaultPage: React.FC = () => {
    const { entries } = useVault();

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <VaultSidebar />

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <VaultHeader />
                
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <PasswordList entries={entries} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VaultPage;