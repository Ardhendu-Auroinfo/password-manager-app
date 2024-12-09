import React, { useState } from 'react';
import { ICreatePasswordEntry, IDecryptedPasswordEntry } from '../../types/vault.types';
import Modal from '../common/Modal';
import PasswordForm from './PasswordForm';
import { VaultService } from '../../services/vault.service';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (data: ICreatePasswordEntry) => {
        try {
            setIsLoading(true);
            setError(null);

            if (entry) {
                await VaultService.updateEntry(entry.id, data);
            } else {
                await VaultService.createEntry(data);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving password:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while saving the password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={entry ? 'Edit Password' : 'Add New Password'}
        >
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{error}</p>
                </div>
            )}
            <PasswordForm
                initialData={entry}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isLoading={isLoading}
            />
        </Modal>
    );
};

export default PasswordModal;