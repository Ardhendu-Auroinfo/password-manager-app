import React from 'react';
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
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: ICreatePasswordEntry) => {
        try {
            setIsLoading(true);
            if (entry) {
                await VaultService.updateEntry(entry.id, data);
            } else {
                await VaultService.createEntry(data);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving password:', error);
            // TODO: Add error handling/notification
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