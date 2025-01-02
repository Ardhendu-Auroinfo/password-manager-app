import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ILoginCredentials } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<ILoginCredentials>({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Basic validation
        if (!credentials.email || !credentials.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // Login will handle the loading state internally
            const result = await login(credentials);
            if (result.success) {
            setLoading(false);
                navigate('/vault');
            } else {
                setLoading(false);
                setError(result.error || 'Invalid credentials');
            }
        } catch (err: any) {
            setLoading(false);
            setError(err.message || 'Login failed');
        }
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
                autoFocus
                disabled={loading}
            />

            <Input
                label="Master Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                showPasswordToggle
                disabled={loading}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={loading}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                    </label>
                </div>

                <div className="text-sm">
                    <Link 
                        to="/forgot-password" 
                        className={`font-medium text-blue-600 hover:text-blue-500 ${loading ? 'pointer-events-none opacity-50' : ''}`}
                    >
                        Forgot your password?
                    </Link>
                </div>
            </div>

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
                {loading ? 'Signing in...' : 'Sign in'}
            </Button>
        </form>
    );
};

export default LoginForm;