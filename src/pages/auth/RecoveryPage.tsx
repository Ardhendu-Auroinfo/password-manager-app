import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AuthService } from '../../services/auth.service';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import PasswordStrengthMeter from '../../components/common/PasswordStrengthMeter';
import { logout, setCredentials } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks/useRedux';
import { secureStore } from '../../utils/secureStore';
import { decryptKeyData, decryptVaultKey } from '../../utils/encryption';

const RecoveryPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [tempToken, setTempToken] = useState('');
    const [encryptedVaultKey, setEncryptedVaultKey] = useState<string>('');
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Get email from location state or sessionStorage
        const storedEmail = sessionStorage.getItem('recovery_email');
        const stateEmail = location.state?.email;
        
        if (!storedEmail && !stateEmail) {
            // If no email is found, redirect back to forgot password
            navigate('/forgot-password');
            return;
        }

        const emailToUse = stateEmail || storedEmail || '';
        setEmail(emailToUse);
        
        // Store email in session storage if it came from state
        if (stateEmail && !storedEmail) {
            sessionStorage.setItem('recovery_email', stateEmail);
        }

        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location, navigate]);

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
                const authData = {
                    user: response.user,
                    token: response.tempToken,
                    isAuthenticated: true
                };
                dispatch(setCredentials(authData));
                setTempToken(response.tempToken);
                setEncryptedVaultKey(response.encryptedVaultKey);
                if(response.encryptedKey){
                    const encryptionKey = decryptKeyData(response.encryptedKey)
                    const vaultKey = decryptVaultKey(response.encryptedVaultKey, encryptionKey)
                    
                    secureStore.setVaultKey(vaultKey)
                    secureStore.setEncryptionKey(encryptionKey)

                }
                setStep('reset');

                setMessage('Code verified successfully. Please set your new password.');
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid recovery code');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePassword = () => {
        const newPass = generateStrongPassword();
        setNewPassword(newPass);
        setConfirmPassword(newPass);
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

        if (!email) {
            setError('Email is required for password reset');
            navigate('/forgot-password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await AuthService.resetPassword(
                tempToken,
                newPassword,
                email,
                encryptedVaultKey
            );
            
            if (response.success) {
                sessionStorage.removeItem('recovery_email');
                secureStore.clearKeys();
                dispatch(logout());
                AuthService.logout();

                navigate('/login', { 
                    state: { 
                        message: 'Password has been reset successfully. Please login with your new password.' 
                    }
                });
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Account Recovery
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {step === 'verify' 
                        ? 'Enter the recovery code sent to your email'
                        : 'Set your new master password'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {message && (
                        <div className="mb-4 bg-green-50 p-4 rounded-md">
                            <p className="text-sm text-green-700">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-50 p-4 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {step === 'verify' ? (
                        <div className="space-y-6">
                            <Input
                                label="Recovery Code"
                                type="text"
                                value={recoveryCode}
                                onChange={(e) => {
                                    // Only allow numbers and limit to 6 digits
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setRecoveryCode(value);
                                }}
                                placeholder="Enter 6-digit code"
                                required
                                autoFocus
                                maxLength={6}
                                pattern="\d{6}"
                                inputMode="numeric"
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
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecoveryPage;