import React, { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { ICategory } from '../../types/category.types';
import { IDecryptedPasswordEntry } from '../../types/vault.types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CategoryModal from './CategoryModal';
import PasswordList from './PasswordList';
import { toast } from 'react-hot-toast';
import { useVault } from '../../contexts/VaultContext';

interface CategoryListProps {
    searchQuery: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ searchQuery }) => {
    const { categories, deleteCategory, getCategoryEntries, moveToCategory } = useCategories();
    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const { entries } = useVault();

    const handleDelete = async (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(categoryId);
                toast.success('Category deleted successfully');
            } catch (error) {
                toast.error('Failed to delete category');
            }
        }
    };

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleUpdateCategory = async (data: { name: string; description?: string; color?: string }) => {
        if (!selectedCategory) return;
        try {
            // await updateCategory(selectedCategory.id, data);
            toast.success('Category updated successfully');
            setIsEditModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const filterEntries = (entries: IDecryptedPasswordEntry[]) => {
        return entries.filter(entry =>
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.website_url?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const QuickAddPassword = ({ categoryId }: { categoryId: string }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
        
        const handleSubmit = async () => {
            if (!selectedEntry) return;
            
            try {
                await moveToCategory(selectedEntry, categoryId);
                toast.success('Password moved to category');
                setIsOpen(false);
            } catch (error) {
                toast.error('Failed to move password');
            }
        };

        return (
            <>
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    Add Password
                </button>
                
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-lg">
                            <h3 className="text-lg font-medium mb-4">Add Existing Password</h3>
                            <select
                                value={selectedEntry || ''}
                                onChange={(e) => setSelectedEntry(e.target.value)}
                                className="w-full mb-4 border rounded"
                            >
                                <option value="">Select a password</option>
                                {entries.map(entry => (
                                    <option key={entry.id} value={entry.id}>
                                        {entry.title} ({entry.username})
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="space-y-6">
            {/* Uncategorized Passwords */}
            <div className="bg-white shadow rounded-lg">
                <div
                    className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
                    onClick={() => toggleCategory('uncategorized')}
                >
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Uncategorized
                    </h3>
                </div>
                {expandedCategories.has('uncategorized') && (
                    <div className="px-4 py-5 sm:p-6">
                        <PasswordList
                            entries={filterEntries(getCategoryEntries(null))}
                            showCategoryBadge={false}
                        />
                    </div>
                )}
            </div>

            {/* Categorized Passwords */}
            {categories.map((category: ICategory) => (
                <div key={category.id} className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <div className="flex justify-between items-center">
                            <h3
                                className="text-lg leading-6 font-medium text-gray-900 cursor-pointer"
                                onClick={() => toggleCategory(category.id)}
                            >
                                {category.name}
                            </h3>
                            <div className="flex space-x-4">
                                <QuickAddPassword categoryId={category.id} />
                                <button
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="text-gray-400 hover:text-blue-500"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {expandedCategories.has(category.id) && (
                        <div className="px-4 py-5 sm:p-6">
                            <PasswordList
                                entries={filterEntries(getCategoryEntries(category.id))}
                                showCategoryBadge={false}
                            />
                        </div>
                    )}
                </div>
            ))}

            <CategoryModal
                category={selectedCategory || undefined}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleUpdateCategory}
                title="Edit Category"
            />
        </div>
    );
};

export default CategoryList;