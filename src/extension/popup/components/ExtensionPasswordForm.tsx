import React, { useState, useEffect } from 'react';
import { ICreatePasswordEntry, IDecryptedPasswordEntry } from '../../../types/vault.types';
import { generateStrongPassword } from '../../../utils/passwordGenerator';

interface ExtensionPasswordFormProps {
    initialData?: IDecryptedPasswordEntry;
    onSubmit: (data: ICreatePasswordEntry) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

interface FormErrors {
    title?: string;
    username?: string;
    password?: string;
    website_url?: string;
}

const ExtensionPasswordForm: React.FC<ExtensionPasswordFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<ICreatePasswordEntry>({
        title: initialData?.title || '',
        username: initialData?.username || '',
        password: initialData?.password || '',
        website_url: initialData?.website_url || '',
        notes: initialData?.notes || '',
        category_id: initialData?.category_id || '',
        favorite: initialData?.favorite || false
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = useState(false);

    // Get current URL from the active tab
    useEffect(() => {
        if (!initialData) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.url) {
                    try {
                        const url = new URL(tabs[0].url);
                        setFormData(prev => ({
                            ...prev,
                            website_url: url.origin,
                            title: url.hostname
                        }));
                    } catch (error) {
                        console.error('Invalid URL:', error);
                    }
                }
            });
        }
    }, [initialData]);

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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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

    const handleBlur = (fieldName: string) => {
        setTouched(prev => ({
            ...prev,
            [fieldName]: true
        }));
        validateForm();
    };

    const handleGeneratePassword = () => {
        const newPassword = generateStrongPassword();
        setFormData(prev => ({ ...prev, password: newPassword }));
        setErrors(prev => ({
            ...prev,
            password: undefined
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            await onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Title Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={() => handleBlur('title')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Gmail Account"
                />
                {touched.title && errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
            </div>

            {/* Username Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username / Email
                </label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={() => handleBlur('username')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="username@example.com"
                />
                {touched.username && errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
            </div>

            {/* Password Input */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Generate
                    </button>
                </div>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        {showPassword ? (
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        )}
                    </button>
                </div>
                {touched.password && errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
            </div>

            {/* Website URL Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                </label>
                <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    onBlur={() => handleBlur('website_url')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                        errors.website_url ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com"
                />
                {touched.website_url && errors.website_url && (
                    <p className="mt-1 text-sm text-red-500">{errors.website_url}</p>
                )}
            </div>

            {/* Notes Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                />
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center">
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

            {/* Form Actions */}
            <div className="flex space-x-3 pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : initialData ? 'Update' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ExtensionPasswordForm;
