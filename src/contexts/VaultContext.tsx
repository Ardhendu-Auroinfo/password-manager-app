import React, { createContext, useContext, useState, useEffect } from 'react';
import { IPasswordEntry, ICreatePasswordEntry, IDecryptedPasswordEntry } from '../types/vault.types';
import { VaultService } from '../services/vault.service';

interface VaultContextType {
    entries: IDecryptedPasswordEntry[];
    loading: boolean;
    error: string | null;
    refreshEntries: () => Promise<void>;
    addEntry: (entry: ICreatePasswordEntry) => Promise<void>;
    updateEntry: (id: string, entry: Partial<ICreatePasswordEntry>) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    searchEntries: (query: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<IDecryptedPasswordEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshEntries = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedEntries = await VaultService.getAllEntries();
            setEntries(fetchedEntries);
        } catch (err) {
            setError('Failed to fetch entries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addEntry = async (entry: ICreatePasswordEntry) => {
        try {
            setLoading(true);
            setError(null);
            await VaultService.createEntry(entry);
            await refreshEntries();
        } catch (err) {
            setError('Failed to add entry');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateEntry = async (id: string, entry: Partial<ICreatePasswordEntry>) => {
        try {
            setLoading(true);
            setError(null);
            await VaultService.updateEntry(id, entry);
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
        } catch (err) {
            setError('Failed to search entries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshEntries();
    }, []);

    return (
        <VaultContext.Provider
            value={{
                entries,
                loading,
                error,
                refreshEntries,
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