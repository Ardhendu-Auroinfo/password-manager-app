import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVault } from '../../contexts/VaultContext';
import { VaultService } from '../../services/vault.service';
import { IDecryptedPasswordEntry, ICreatePasswordEntry } from '../../types/vault.types';
import { getBrowserAPI } from '../../utils/browser';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import LoginView from './components/LoginView';
import PasswordEntry from './components/PasswordEntry';
import ExtensionPasswordForm from './components/ExtensionPasswordForm';
import './popup.css';
interface DropdownState {
    [key: string]: boolean;
}

const Popup: React.FC = () => {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<IDecryptedPasswordEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { entries, loading, refreshEntries } = useVault();
    const dispatch = useDispatch();

    // Form state for add/edit
    const [formData, setFormData] = useState<ICreatePasswordEntry>({
        title: '',
        username: '',
        password: '',
        website_url: '',
        notes: '',
        category: '',
        favorite: false
    });

    const [openDropdown, setOpenDropdown] = useState<DropdownState>({});

    // Function to toggle dropdown
    const toggleDropdown = (entryId: string) => {
        setOpenDropdown(prev => ({
            ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
            [entryId]: !prev[entryId]
        }));
    };

    // Function to close all dropdowns
    const closeAllDropdowns = () => {
        setOpenDropdown({});
    };


    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const result = await chrome.storage.local.get('auth');
                console.log('Storage result:', result);
                
                if (result.auth) {
                    console.log('Found auth data:', result.auth);
                    dispatch(setCredentials(result.auth));
                } else {
                    console.log('No auth data found in storage');
                    dispatch(setCredentials(null));
                }
            } catch (error) {
                console.error('Error retrieving auth data:', error);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const authStateListener = (message: any) => {
            console.log('Received message in popup:', message);
            if (message.type === 'AUTH_STATE_CHANGED') {
                console.log('Auth state changed:', message.payload);
                dispatch(setCredentials(message.payload));
            }
        };

        chrome.runtime.onMessage.addListener(authStateListener);

        return () => {
            chrome.runtime.onMessage.removeListener(authStateListener);
        };
    }, [dispatch]);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                try {
                    const url = new URL(tabs[0].url);
                    setCurrentUrl(url.hostname);
                } catch (error) {
                    console.error('Invalid URL:', error);
                }
            }
        });
    }, []);

    const filteredEntries = entries.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.website_url?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Sort entries by most recent first
    const sortedEntries = [...filteredEntries].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );


    // const handleAddEntry = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     try {
    //         await VaultService.createEntry(formData);
    //         await refreshEntries();
    //         setShowAddForm(false);
    //         setFormData({
    //             title: '',
    //             username: '',
    //             password: '',
    //             website_url: '',
    //             notes: '',
    //             category: '',
    //             favorite: false
    //         });
    //     } catch (error) {
    //         console.error('Failed to add entry:', error);
    //     }
    // };
    const handleAddEntry = async (data: ICreatePasswordEntry) => {
        try {
            setIsLoading(true);
            await VaultService.createEntry(data);
            await refreshEntries();
            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to add entry:', error);
            // Handle error (show toast notification)
        } finally {
            setIsLoading(false);
        }
    };
    const handleEditEntry = async (data: ICreatePasswordEntry) => {
        if (!selectedEntry) return;

        try {
            setIsLoading(true);
            await VaultService.updateEntry(selectedEntry.id, data);
            await refreshEntries();
            setShowEditForm(false);
            setSelectedEntry(null);
        } catch (error) {
            console.error('Failed to update entry:', error);
            // Handle error (show toast notification)
        } finally {
            setIsLoading(false);
        }
    };

    // const handleEditEntry = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!selectedEntry) return;

    //     try {
    //         await VaultService.updateEntry(selectedEntry.id, formData);
    //         await refreshEntries();
    //         setShowEditForm(false);
    //         setSelectedEntry(null);
    //     } catch (error) {
    //         console.error('Failed to update entry:', error);
    //     }
    // };

    // const handleDeleteEntry = async (id: string) => {
    //     if (window.confirm('Are you sure you want to delete this entry?')) {
    //         try {
    //             await VaultService.deleteEntry(id);
    //             await refreshEntries();
    //         } catch (error) {
    //             console.error('Failed to delete entry:', error);
    //         }
    //     }
    // };

    const handleDeleteEntry = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this password?')) {
            try {
                setIsLoading(true);
                await VaultService.deleteEntry(id);
                await refreshEntries();
            } catch (error) {
                console.error('Failed to delete entry:', error);
                // Handle error (show toast notification)
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="w-80 h-96 bg-white p-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-blue-500 p-3 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Password Manager</h2>
                <p className="text-gray-600 text-center mb-6">
                    Securely access your passwords across the web
                </p>
                <div className="space-y-4">
                    <button 
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/login' })}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Login</span>
                    </button>
                    <button 
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/register' })}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Sign Up</span>
                    </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-6">
                    Your passwords are encrypted and secure
                </p>
            </div>
        );
    }

    // Entry Form Component
    // const EntryForm = ({ isEdit = false }) => (
    //     <form onSubmit={isEdit ? handleEditEntry : handleAddEntry} className="p-4 space-y-4">
    //         <div>
    //             <input
    //                 type="text"
    //                 placeholder="Title"
    //                 value={formData.title}
    //                 onChange={e => setFormData({ ...formData, title: e.target.value })}
    //                 className="w-full px-3 py-2 border rounded-md"
    //                 required
    //             />
    //         </div>
    //         <div>
    //             <input
    //                 type="text"
    //                 placeholder="Username"
    //                 value={formData.username}
    //                 onChange={e => setFormData({ ...formData, username: e.target.value })}
    //                 className="w-full px-3 py-2 border rounded-md"
    //                 required
    //             />
    //         </div>
    //         <div>
    //             <input
    //                 type="password"
    //                 placeholder="Password"
    //                 value={formData.password}
    //                 onChange={e => setFormData({ ...formData, password: e.target.value })}
    //                 className="w-full px-3 py-2 border rounded-md"
    //                 required
    //             />
    //         </div>
    //         <div>
    //             <input
    //                 type="url"
    //                 placeholder="Website URL"
    //                 value={formData.website_url}
    //                 onChange={e => setFormData({ ...formData, website_url: e.target.value })}
    //                 className="w-full px-3 py-2 border rounded-md"
    //             />
    //         </div>
    //         <div>
    //             <textarea
    //                 placeholder="Notes"
    //                 value={formData.notes}
    //                 onChange={e => setFormData({ ...formData, notes: e.target.value })}
    //                 className="w-full px-3 py-2 border rounded-md"
    //             />
    //         </div>
    //         <div className="flex justify-end space-x-2">
    //             <button
    //                 type="button"
    //                 onClick={() => isEdit ? setShowEditForm(false) : setShowAddForm(false)}
    //                 className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
    //             >
    //                 Cancel
    //             </button>
    //             <button
    //                 type="submit"
    //                 className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
    //             >
    //                 {isEdit ? 'Update' : 'Add'}
    //             </button>
    //         </div>
    //     </form>
    // );

    
    return (
        <div className="w-80 h-[600px] bg-white flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 bg-white border-b">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search passwords..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pl-10 pr-4 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg 
                        className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {showAddForm && (
                    <div className="p-4">
                        <ExtensionPasswordForm
                            onSubmit={handleAddEntry}
                            onCancel={() => setShowAddForm(false)}
                            isLoading={isLoading}
                        />
                    </div>
                )}
                
                {showEditForm && selectedEntry && (
                    <div className="p-4">
                        <ExtensionPasswordForm
                            initialData={selectedEntry}
                            onSubmit={handleEditEntry}
                            onCancel={() => {
                                setShowEditForm(false);
                                setSelectedEntry(null);
                            }}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* Password List */}
                {!showAddForm && !showEditForm && (
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Passwords
                            </h3>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Add New
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : sortedEntries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                {searchQuery ? 'No passwords found' : 'No passwords saved yet'}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sortedEntries.map(entry => (
                                    <PasswordEntry
                                        key={entry.id}
                                        entry={entry}
                                        onEdit={(entry) => {
                                            setSelectedEntry(entry);
                                            setShowEditForm(true);
                                        }}
                                        onDelete={handleDeleteEntry}
                                        isDropdownOpen={!!openDropdown[entry.id]}
                                        onToggleDropdown={(id) => toggleDropdown(id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 p-4 border-t bg-white">
                <button 
                    onClick={() => chrome.tabs.create({ url: 'http://localhost:3000/vault' })}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>Open Vault</span>
                </button>
            </div>
        </div>
    );
};

export default Popup;