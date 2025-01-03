import React, { useState } from 'react';
import { ICreatePasswordEntry, IDecryptedPasswordEntry } from '../../types/vault.types';
import Modal from '../common/Modal';
import PasswordForm from './PasswordForm';
import { useVault } from '../../contexts/VaultContext';
import { toast } from 'react-hot-toast';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry?: IDecryptedPasswordEntry;
    onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
    isOpen,
    onClose,
    entry,
    onSuccess
}) => {
    const { addEntry } = useVault();
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleClose = () => {
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleSubmit = async (data: ICreatePasswordEntry) => {
        try {
            setLoading(true);
            
            // Validate data before submission
            if (!data.title || !data.username || !data.password) {
                throw new Error('Please fill in all required fields');
            }
            
            await addEntry(data);
            setHasChanges(false);
            onClose();
            onSuccess?.();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add password';
            console.error('Failed to add password:', error);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={entry ? 'Edit Password' : 'Add New Password'}
        >
            <PasswordForm
                initialData={entry}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                isLoading={loading}
            />
        </Modal>
    );
};

export default PasswordModal;