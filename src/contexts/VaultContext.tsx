import React, { createContext, useContext, useState, useEffect } from 'react';
import { IPasswordEntry, ICreatePasswordEntry, IDecryptedPasswordEntry } from '../types/vault.types';
import { VaultService } from '../services/vault.service';
import { useAuth } from '../hooks/useAuth';

interface VaultContextType {
    entries: IDecryptedPasswordEntry[];
    favoriteEntries: IDecryptedPasswordEntry[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    refreshEntries: () => Promise<void>;
    refreshFavoriteEntries: () => Promise<void>;
    addEntry: (entry: ICreatePasswordEntry) => Promise<IDecryptedPasswordEntry>;
    updateEntry: (id: string, entry: Partial<ICreatePasswordEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    searchEntries: (query: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<IDecryptedPasswordEntry[]>([]);
    const [favoriteEntries, setFavoriteEntries] = useState<IDecryptedPasswordEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { isAuthenticated } = useAuth();

    const refreshEntries = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedEntries = await VaultService.getAllEntries();
            console.log("Fetched entries:", fetchedEntries);
            setEntries(fetchedEntries);
        } catch (err) {
            console.error('Error fetching entries:', err);
            setError('Failed to fetch entries');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const refreshFavoriteEntries = async () => {
        try {
            setLoading(true);
            setError(null);
            const favoriteEntries = await VaultService.getFavoriteEntries();
            setFavoriteEntries(favoriteEntries);
        } catch (err) {
            setError('Failed to fetch favorite entries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addEntry = async (entry: ICreatePasswordEntry) => {
        try {
            setLoading(true);
            setError(null);
            const newEntry = await VaultService.createEntry(entry);
            
            // Update the entries list with the new entry
            setEntries(prevEntries => {
                // Remove any existing entry with the same ID (if it exists)
                const filteredEntries = prevEntries.filter(e => e.id !== newEntry.id);
                return [...filteredEntries, newEntry];
            });
            
            return newEntry;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add entry';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const updateEntry = async (id: string, entry: Partial<ICreatePasswordEntry>) => {
        try {
            setLoading(true);
            setError(null);

            // Ensure the favorite field is a boolean
            const updatedEntry = {
                ...entry,
                favorite: entry.favorite === true // Ensure it's a boolean
            };

            await VaultService.updateEntry(id, updatedEntry);
            await refreshEntries();
        } catch (err) {
            setError('Failed to update entry');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            await VaultService.deleteEntry(id);
            await refreshEntries();
        } catch (err) {
            setError('Failed to delete entry');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchEntries = async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            const searchResults = await VaultService.searchEntries(query);
            setEntries(searchResults);
            setLoading(false);
        } catch (err) {
            setError('Failed to search entries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshEntries();
            refreshFavoriteEntries();
        }
    }, [isAuthenticated]);

    return (
        <VaultContext.Provider
            value={{
                entries,
                favoriteEntries,
                loading,
                error,
                searchQuery,
                setSearchQuery,
                refreshEntries,
                refreshFavoriteEntries,
                addEntry, 
                updateEntry,
                deleteEntry,
                searchEntries
            }}
        >
            {children}
        </VaultContext.Provider>
    );
};

export const useVault = () => {
    const context = useContext(VaultContext);
    if (context === undefined) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};