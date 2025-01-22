import React, { useState } from 'react';
import { ICreatePasswordEntry, IDecryptedPasswordEntry } from '../../types/vault.types';
import Input from '../common/Input';
import Button from '../common/Button';
import { generateStrongPassword } from '../../utils/passwordGenerator';

interface PasswordFormProps {
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

const PasswordForm: React.FC<PasswordFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<ICreatePasswordEntry>({
        title: initialData?.title || '',
        username: initialData?.username || '',
        password: initialData?.password || '',
        notes: initialData?.notes || '',
        website_url: initialData?.website_url || '',
        category_id: initialData?.category_id || '',
        favorite: initialData?.favorite || false
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Website URL validation (if provided)
        if (formData.website_url && !formData.website_url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
            newErrors.website_url = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error when user starts typing
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                error={touched.title ? errors.title : undefined}
                required
                placeholder="e.g., Gmail Account"
            />

            <Input
                label="Username / Email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                error={touched.username ? errors.username : undefined}
                required
                placeholder="username@example.com"
            />

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
                        Generate Password
                    </button>
                </div>
                <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    error={touched.password ? errors.password : undefined}
                    required
                    showPasswordToggle
                />
            </div>

            <Input
                label="Website URL"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                onBlur={() => handleBlur('website_url')}
                error={touched.website_url ? errors.website_url : undefined}
                placeholder="https://example.com"
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
            </div>

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

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <Button
                    type="submit"
                    loading={isLoading}
                    fullWidth
                >
                    {initialData ? 'Update' : 'Save'} Password
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    fullWidth
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default PasswordForm;