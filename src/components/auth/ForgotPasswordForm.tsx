import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import Input from '../common/Input';
import Button from '../common/Button';

const ForgotPasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleGetHint = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await AuthService.getPasswordHint(email);
            if (response.success) {
                setMessage('Password hint has been sent to your email');
            }
            else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to get password hint');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await AuthService.requestPasswordReset(email);
            if (response.success) {
                // Store email in sessionStorage for the recovery page
                sessionStorage.setItem('recovery_email', email);
                // Navigate to recovery page
                navigate('/account-recovery', { 
                    state: { 
                        email,
                        message: 'Recovery code has been sent to your email' 
                    }
                });
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initiate password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full space-y-8">
            <div className="space-y-6">
                <div>
                    <Input
                        label="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                {message && (
                    <div className="bg-green-50 p-4 rounded-md">
                        <p className="text-sm text-green-700">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={handleGetHint}
                        loading={loading}
                    >
                        {loading ? 'Sending...' : 'Send Password Hint'}
                    </Button>
                    <Button
                        type="button"
                        fullWidth
                        onClick={handleResetPassword}
                        loading={loading}
                    >
                        {loading ? 'Sending Recovery Code...' : 'Reset Password'}
                    </Button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;