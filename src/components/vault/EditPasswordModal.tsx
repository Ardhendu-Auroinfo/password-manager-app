import React, { useState } from 'react';
import { XMarkIcon} from '@heroicons/react/24/outline';
import { useVault } from '../../contexts/VaultContext';
import { IDecryptedPasswordEntry } from '../../types/vault.types';
import PasswordStrengthMeter from '../common/PasswordStrengthMeter';
import { toast } from 'react-hot-toast';
import Input from '../common/Input';

interface EditPasswordModalProps {
    entry: IDecryptedPasswordEntry;
    isOpen: boolean;
    onClose: () => void;
}

interface FormErrors {
    title?: string;
    username?: string;
    password?: string;
    website_url?: string;
    favorite?: boolean;
}

const EditPasswordModal: React.FC<EditPasswordModalProps> = ({ entry, isOpen, onClose }) => {
    const { updateEntry, refreshFavoriteEntries } = useVault();
    const [formData, setFormData] = useState({
        title: entry.title,
        username: entry.username,
        password: entry.password,
        website_url: entry.website_url || '',
        notes: entry.notes || '',
        favorite: entry.favorite || false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.website_url && !isValidUrl(formData.website_url)) {
            newErrors.website_url = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await updateEntry(entry.id, formData);
            if (entry.favorite && !formData.favorite) {
                await refreshFavoriteEntries();
            }
            toast.success('Password updated successfully');
            onClose();
        } catch (err) {
            toast.error('Failed to update password entry');
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium">Edit Password Entry</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form 
                    onSubmit={handleSubmit} 
                    className="p-4" 
                    autoComplete="off"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.title ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Website URL
                            </label>
                            <input
                                type="text"
                                name="website_url"
                                value={formData.website_url}
                                onChange={handleChange}
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.website_url ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.website_url && (
                                <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="off"
                                spellCheck="false"
                                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.username ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className={`block w-full pr-10 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}                                    
                                    required
                                    showPasswordToggle
                                />
                                
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                            <PasswordStrengthMeter 
                                password={formData.password} 
                                email={formData.username}
                            />
                            
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                    <input
                        type="checkbox"
                            name="favorite"
                            checked={formData.favorite}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Add to favorites
                        </label>
                        </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPasswordModal;