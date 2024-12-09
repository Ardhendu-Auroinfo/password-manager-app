import CryptoJS from 'crypto-js';

export const encryptData = (data: string, key: string | null): string => {
    if (!key) {
        throw new Error('Encryption key is missing');
    }

    try {
        return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

export const decryptData = (encryptedData: string, key: string | null): string => {
    if (!key) {
        throw new Error('Decryption key is missing');
    }

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

export const generateMasterKey = (masterPassword: string, salt: string): string => {
    return CryptoJS.PBKDF2(masterPassword, salt, {
        keySize: 256 / 32,
        iterations: 10000
    }).toString();
};