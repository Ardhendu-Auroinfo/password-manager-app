import React, { useState } from 'react';
import { AuthService } from '../../services/auth.service';
import Input from '../common/Input';
import Button from '../common/Button';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import PasswordStrengthMeter from '../common/PasswordStrengthMeter';

enum RecoveryStep {
    REQUEST = 'request',
    VERIFY = 'verify',
    RESET = 'reset',
    COMPLETE = 'complete'
}

const RecoverySteps: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<RecoveryStep>(RecoveryStep.REQUEST);
    const [email, setEmail] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [tempToken, setTempToken] = useState('');

    const handleRequestRecovery = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.requestPasswordReset(email);
            if (response.success) {
                setMessage('Recovery code has been sent to your email');
                setCurrentStep(RecoveryStep.VERIFY);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to request recovery');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!recoveryCode) {
            setError('Please enter the recovery code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.verifyRecoveryToken(email, recoveryCode);
            if (response.success) {
                setTempToken(response.tempToken);
                setCurrentStep(RecoveryStep.RESET);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid recovery code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 12) {
            setError('Password must be at least 12 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.resetPassword(tempToken, newPassword);
            if (response.success) {
                setMessage('Password has been reset successfully');
                setCurrentStep(RecoveryStep.COMPLETE);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePassword = () => {
        const newPassword = generateStrongPassword();
        setNewPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    const renderStep = () => {
        switch (currentStep) {
            case RecoveryStep.REQUEST:
                return (
                    <div className="space-y-6">
                        <Input
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                        <Button
                            type="button"
                            fullWidth
                            onClick={handleRequestRecovery}
                            loading={loading}
                        >
                            {loading ? 'Sending...' : 'Send Recovery Code'}
                        </Button>
                    </div>
                );

            case RecoveryStep.VERIFY:
                return (
                    <div className="space-y-6">
                        <div className="text-sm text-gray-600">
                            We've sent a recovery code to {email}. 
                            Please check your email and enter the code below.
                        </div>
                        <Input
                            label="Recovery Code"
                            type="text"
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(e.target.value)}
                            required
                            autoFocus
                        />
                        <Button
                            type="button"
                            fullWidth
                            onClick={handleVerifyCode}
                            loading={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Button>
                    </div>
                );

            case RecoveryStep.RESET:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Master Password
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
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                autoFocus
                                showPasswordToggle
                            />
                            {newPassword && (
                                <PasswordStrengthMeter 
                                    password={newPassword}
                                    email={email}
                                />
                            )}
                        </div>

                        <Input
                            label="Confirm Master Password"
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            showPasswordToggle
                        />

                        <div className="text-sm text-gray-600">
                            Password must be at least 12 characters with 1 uppercase, 
                            1 lowercase, 1 number, and 1 special character
                        </div>

                        <Button
                            type="button"
                            fullWidth
                            onClick={handleResetPassword}
                            loading={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </div>
                );

            case RecoveryStep.COMPLETE:
                return (
                    <div className="text-center space-y-6">
                        <div className="text-green-600">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Password Reset Complete
                        </h3>
                        <p className="text-sm text-gray-600">
                            Your password has been reset successfully. You can now log in with your new password.
                        </p>
                        <Button
                            type="button"
                            fullWidth
                            onClick={() => window.location.href = '/login'}
                        >
                            Back to Login
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-md w-full space-y-8">
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

            {renderStep()}
        </div>
    );
};

export default RecoverySteps;