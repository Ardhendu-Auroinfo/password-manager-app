import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    type = 'text',
    showPasswordToggle = false,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? 'text' : type}
                    className={`
                        appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
                        placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                        sm:text-sm ${error ? 'border-red-300' : 'border-gray-300'}
                        ${showPasswordToggle ? 'pr-10' : ''}
                    `}
                    {...props}
                />
                {showPasswordToggle && type === 'password' && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;