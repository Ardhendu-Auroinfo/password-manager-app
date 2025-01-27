import React, { useState } from 'react';
import { VaultService } from '../../../services/vault.service';
import { ICreatePasswordEntry } from '../../../types/vault.types';

interface AutosavePromptProps {
  initialData?: ICreatePasswordEntry;
  onClose: () => void;
}

const AutosavePrompt: React.FC<AutosavePromptProps> = ({ initialData, onClose }) => {
  const [formData, setFormData] = useState<ICreatePasswordEntry>({
    title: initialData?.title || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    website_url: initialData?.website_url || '',
    notes: initialData?.notes || '',
    category_id: initialData?.category_id || '',
    favorite: initialData?.favorite || false
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('handleSave called');
    if (!validateForm()) return;
    console.log('Form data is valid');
    try {
      setSaving(true);
      console.log('Saving started');
      try {
        await VaultService.createEntry(formData);
        console.log('Entry saved successfully');
        onClose();
      } catch (error) {
        console.error('Failed to save credentials:', error);
      } finally {
        setSaving(false);
        console.log('Saving finished');
      }
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Save Password?</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md">
            {saving ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutosavePrompt;