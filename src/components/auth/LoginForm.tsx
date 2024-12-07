import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ILoginCredentials } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();
    const [credentials, setCredentials] = useState<ILoginCredentials>({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(credentials);
        if (success) {
            navigate('/vault');
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
                error={error?.field === 'email' ? error.message : ''}
            />

            <Input
                label="Master Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                error={error?.field === 'password' ? error.message : ''}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                    </label>
                </div>

                <div className="text-sm">
                    <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        Forgot your password?
                    </a>
                </div>
            </div>

            <Button
                type="submit"
                fullWidth
                loading={loading}
            >
                Sign in
            </Button>
        </form>
    );
};

export default LoginForm;