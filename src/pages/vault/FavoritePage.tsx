import React, { useEffect } from 'react';
import VaultSidebar from '../../components/vault/VaultSidebar';
import VaultHeader from '../../components/vault/VaultHeader';
import PasswordList from '../../components/vault/PasswordList';
import { useVault } from '../../contexts/VaultContext';

const FavoritePage: React.FC = () => {
    const { favoriteEntries, refreshFavoriteEntries, loading, error } = useVault();

    useEffect(() => {
        refreshFavoriteEntries();
    }, []);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <VaultSidebar />

            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <VaultHeader />
                
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Favorite Passwords</h1>
                            <PasswordList 
                                entries={favoriteEntries} 
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FavoritePage;