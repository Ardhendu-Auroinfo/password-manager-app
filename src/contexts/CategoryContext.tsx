import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICategory, ICreateCategory } from '../types/category.types';
import { CategoryService } from '../services/category.service';
import { IDecryptedPasswordEntry } from '../types/vault.types';
import { useVault } from './VaultContext';

interface CategoryContextType {
    categories: ICategory[];
    loading: boolean;
    error: string | null;
    refreshCategories: () => Promise<void>;
    createCategory: (category: ICreateCategory) => Promise<ICategory>;
    updateCategory: (id: string, category: Partial<ICreateCategory>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getCategoryEntries: (categoryId: string | null) => IDecryptedPasswordEntry[];
    moveToCategory: (entryId: string, categoryId: string | null) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { entries, updateEntry } = useVault();

    const refreshCategories = async () => {
        setLoading(true);
        try {
            const data = await CategoryService.getAllCategories();
            setCategories(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch categories');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCategories();
    }, []);

    const createCategory = async (category: ICreateCategory) => {
        const newCategory = await CategoryService.createCategory(category);
        await refreshCategories();
        return newCategory;
    };

    const updateCategory = async (id: string, category: Partial<ICreateCategory>) => {
        await CategoryService.updateCategory(id, category);
        await refreshCategories();
    };

    const deleteCategory = async (id: string) => {
        await CategoryService.deleteCategory(id);
        await refreshCategories();
    };

    const getCategoryEntries = (categoryId: string | null) => {
        return entries.filter(entry => entry.category_id === categoryId);
    };

    const moveToCategory = async (entryId: string, categoryId: string | null) => {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            await updateEntry(entryId, { ...entry, category_id: categoryId || undefined });
        }
    };

    return (
        <CategoryContext.Provider
            value={{
                categories,
                loading,
                error,
                refreshCategories,
                createCategory,
                updateCategory,
                deleteCategory,
                getCategoryEntries,
                moveToCategory
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
};