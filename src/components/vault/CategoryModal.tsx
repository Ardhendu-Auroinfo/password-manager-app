import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ICategory } from '../../types/category.types';
import Button from '../common/Button';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description?: string; color?: string }) => Promise<void>;
    category?: ICategory;
    title: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    category,
    title
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description || '',
                color: category.color || '#3B82F6'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                color: '#3B82F6'
            });
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!formData.name.trim()) {
            setErrors({ name: 'Category name is required' });
            return;
        }

        try {
            setLoading(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting category:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-medium">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Color
                            </label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="mt-1 block rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : category ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;