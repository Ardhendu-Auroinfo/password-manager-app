import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';
import { ShareService } from '../../services/share.service';

interface SharePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    entryId: string;
    entryTitle: string;
}

const SharePasswordModal: React.FC<SharePasswordModalProps> = ({
    isOpen,
    onClose,
    entryId,
    entryTitle
}) => {
    const [email, setEmail] = useState('');
    const [permissionLevel, setPermissionLevel] = useState<'read' | 'write'>('read');
    const [expiresIn, setExpiresIn] = useState('never');
    const [isLoading, setIsLoading] = useState(false);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const expiresAt = expiresIn === 'never' 
                ? undefined 
                : new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000);

            await ShareService.sharePassword({
                entryId,
                sharedWithEmail: email,
                permissionLevel,
                expiresAt
            });

            toast.success('Password shared successfully');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to share password';
            toast.error(errorMessage);
            console.error('Share error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Share "${entryTitle}"`}>
            <form onSubmit={handleShare} className="space-y-4">
                <Input
                    label="Recipient Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Permission Level
                    </label>
                    <select
                        value={permissionLevel}
                        onChange={(e) => setPermissionLevel(e.target.value as 'read' | 'write')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="read">View Only</option>
                        <option value="write">View & Edit</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Expires In
                    </label>
                    <select
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="never">Never</option>
                        <option value="24hr">24 hours</option>
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={isLoading}>
                        Share
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SharePasswordModal;