import CryptoJS from 'crypto-js';

export const encryptData = (data: string, key: string): string => {
    try {
        return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

export const decryptData = (encryptedData: string, key: string): string => {
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