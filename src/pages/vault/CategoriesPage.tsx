import React, { useState } from 'react';
import VaultSidebar from '../../components/vault/VaultSidebar';
import VaultHeader from '../../components/vault/VaultHeader';
import { useCategories } from '../../contexts/CategoryContext';
import { useVault } from '../../contexts/VaultContext';
import CategoryModal from '../../components/vault/CategoryModal';
import { ICategory } from '../../types/category.types';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import PasswordList from '../../components/vault/PasswordList';
import { IDecryptedPasswordEntry } from '../../types/vault.types';
import QuickAddPassword from '../../components/vault/QuickAddPassword';
import { VaultService } from '../../services/vault.service';

const CategoriesPage: React.FC = () => {
    const { categories, createCategory, updateCategory, deleteCategory, getCategoryEntries } = useCategories();
    const { searchQuery } = useVault();
    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const handleCreateCategory = async (data: { name: string; description?: string; color?: string }) => {
        try {
            await createCategory(data);
            toast.success('Category created successfully');
            setIsCreateModalOpen(false);
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    const handleUpdateCategory = async (data: { name: string; description?: string; color?: string }) => {
        if (!selectedCategory) return;
        try {
            await updateCategory(selectedCategory.id, data);
            toast.success('Category updated successfully');
            setIsEditModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category? All passwords will be moved to uncategorized.')) {
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

    const filterEntries = (entries: IDecryptedPasswordEntry[]) => {
        if (!searchQuery) return entries;
        return entries.filter(entry =>
            entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.website_url?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    
    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <VaultSidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <VaultHeader />

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-5">Categories</h1>

                            <div className="space-y-4">
                                {/* Uncategorized Section */}
                                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                                    <div
                                        className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleCategory('uncategorized')}
                                    >
                                        <div className="flex items-center">
                                            {expandedCategories.has('uncategorized') ?
                                                <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" /> :
                                                <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                                            }
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Uncategorized
                                            </h3>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                                            {filterEntries(getCategoryEntries('')).length}
                                        </span>
                                    </div>
                                    {expandedCategories.has('uncategorized') && (
                                        <div className="px-4 py-5 sm:p-6">
                                            <PasswordList
                                                entries={filterEntries(getCategoryEntries(''))}
                                                showCategoryBadge={false}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Categories */}
                                {categories.map(category => (
                                    <div key={category.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                                        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                                            <div className="flex justify-between items-center">
                                                <div
                                                    className="flex items-center cursor-pointer"
                                                    onClick={() => toggleCategory(category.id)}
                                                >
                                                    {expandedCategories.has(category.id) ?
                                                        <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" /> :
                                                        <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                    }
                                                    <div className="flex items-center">
                                                        <span
                                                            className="w-3 h-3 rounded-full mr-2"
                                                            style={{ backgroundColor: category.color || '#3B82F6' }}
                                                        />
                                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <QuickAddPassword categoryId={category.id} />
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                                                        {filterEntries(getCategoryEntries(category.id)).length}
                                                    </span>
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
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {category.description && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {category.description}
                                                </p>
                                            )}
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
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <CategoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateCategory}
                title="Create New Category"
            />

            <CategoryModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleUpdateCategory}
                category={selectedCategory || undefined}
                title="Edit Category"
            />
        </div>
    );
};

export default CategoriesPage;