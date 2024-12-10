import React from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LogoutButton: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        try {
            logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
            title="Logout"
        >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            <span>Logout</span>
        </button>
    );
};

export default LogoutButton;