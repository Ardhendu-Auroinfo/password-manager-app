import React, { useState } from 'react';
import VaultSidebar from '../../components/vault/VaultSidebar';
import VaultHeader from '../../components/vault/VaultHeader';
import SharedPasswordsList from '../../components/vault/SharedPasswordsList';
import SharedByMeList from '../../components/vault/SharedByMeList';

const SharingCenterPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('shared-with-me');

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <VaultSidebar />

            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <VaultHeader />

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button
                                        onClick={() => setActiveTab('shared-with-me')}
                                        className={`${activeTab === 'shared-with-me'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Shared with Me
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('shared-by-me')}
                                        className={`${activeTab === 'shared-by-me'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Shared by Me
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Panels */}
                            <div className="mt-6">
                                {activeTab === 'shared-with-me' && (
                                    <SharedPasswordsList />
                                )}
                                {activeTab === 'shared-by-me' && (
                                    <SharedByMeList />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SharingCenterPage;