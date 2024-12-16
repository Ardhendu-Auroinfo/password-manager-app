import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Forgot master password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll help you recover your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <ForgotPasswordForm />

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;