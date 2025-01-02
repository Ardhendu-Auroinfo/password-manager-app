import React from 'react';

const LoginView: React.FC = () => {
    return (
        <div className="w-80 h-96 bg-white p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-500 p-3 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Password Manager</h2>
        {/* Rest of the login view code */}
      </div>
    );
};

export default LoginView;