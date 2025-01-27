import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IRegisterCredentials } from '../../types';
import { validatePassword, validatePasswordMatch } from '../../utils/validation';
import Button from '../common/Button';
import Input from '../common/Input';
import PasswordStrengthMeter from '../common/PasswordStrengthMeter';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import { AuthService } from '../../services/auth.service';
import { toast } from 'react-hot-toast';

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [credentials, setCredentials] = useState<IRegisterCredentials>({
        email: '',
        password: '',
        confirmPassword: '',
        masterPasswordHint: ''
    });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation errors when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!validatePassword(credentials.password)) {
            errors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character';
        }

        if (!validatePasswordMatch(credentials.password, credentials.confirmPassword)) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) return;

        setLoading(true);
        const response   = await AuthService.register(credentials);
        if (response.success) {
            toast.success('Registration successful');
            navigate('/login');
        }
        else{
            setError(response.message || 'Some error occurred');
        }
       
        setLoading(false);
    };

    const handleGeneratePassword = () => {
        const newPassword = generateStrongPassword();
        setCredentials(prev => ({
            ...prev,
            password: newPassword,
            confirmPassword: newPassword
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Email address"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                required
            // error={error?.field === 'email' ? error.message : ''}
            />

            <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Master Password
                    </label>
                    <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        Generate a Strong Password
                    </button>
                </div>
                <Input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    showPasswordToggle
                // error={validationErrors.password || (error?.field === 'password' ? error.message : '')}
                />
                {credentials.password && (
                    <PasswordStrengthMeter
                        password={credentials.password}
                        email={credentials.email}
                    />
                )}
            </div>

            <div>
                <Input
                    label="Confirm Master Password"
                    type="password"
                    name="confirmPassword"
                    value={credentials.confirmPassword}
                    onChange={handleChange}
                    required
                    showPasswordToggle
                    error={validationErrors.confirmPassword}
                />
            </div>

            <Input
                label="Master Password Hint (Optional)"
                type="text"
                name="masterPasswordHint"
                value={credentials.masterPasswordHint}
                onChange={handleChange}
            />
            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">
                        {error}
                    </span>
                </div>
            )}
            <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
            >
                {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
        </form>
    );
};

export default RegisterForm;