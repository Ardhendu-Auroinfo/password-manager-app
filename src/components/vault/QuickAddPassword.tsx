import React, { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { toast } from 'react-hot-toast';
import { useVault } from '../../contexts/VaultContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QuickAddPasswordProps {
    categoryId: string;
}

const QuickAddPassword: React.FC<QuickAddPasswordProps> = ({ categoryId }) => {
    const { moveToCategory } = useCategories();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const { entries } = useVault();

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
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-lg">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-lg font-medium">Add Existing Password</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-4">
                                <select
                                    value={selectedEntry || ''}
                                    onChange={(e) => setSelectedEntry(e.target.value)}
                                    className="w-full mb-4 border rounded"
                                >
                                    <option value="">Select a password</option>
                                    {entries
                                        .filter((entry) => entry.category_id === '')
                                        .map((entry) => (
                                            <option key={entry.id} value={entry.id}>
                                                {entry.title}
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
                    </div>
                </div>
            )}
        </>
    );
};

export default QuickAddPassword;