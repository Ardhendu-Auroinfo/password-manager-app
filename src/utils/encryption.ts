import CryptoJS from 'crypto-js';

// Constants for encryption
const PBKDF2_ITERATIONS = 600000;
const KEY_SIZE = 256;
const SALT_SIZE = 32;
const IV_SIZE = 12; // 96 bits for AES-GCM
const secretKey = process.env.REACT_APP_SECRET_KEY || '';

interface EncryptedData {
    ciphertext: string;
    iv: string;
    salt: string;
    version: number;
}

interface KeyPair {
  authKey: string;
  encryptionKey: string;
  symmetricKey: string;
}

/**
 * Converts string to ArrayBuffer
 */
const str2ab = (str: string): ArrayBuffer => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

/**
 * Converts ArrayBuffer to string
 */
const ab2str = (buf: ArrayBuffer): string => {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
};

/**
 * Generates a cryptographically secure random string
 */
const generateRandomBytes = (size: number): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(size));
};

/**
 * Derives an encryption key using Web Crypto API
 */
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as raw key
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

/**
 * Encrypts data using AES-GCM
 */
export const encryptDatas = async (data: string, masterKey: string): Promise<string> => {
    try {
        const salt = generateRandomBytes(SALT_SIZE);
        const iv = generateRandomBytes(IV_SIZE);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // Derive encryption key
        const key = await deriveKey(masterKey, salt);

        // Encrypt the data
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );

        // Convert encrypted data to base64
        const encryptedBase64 = btoa(ab2str(encryptedBuffer));
        
        // Package encrypted data
        const encryptedData: EncryptedData = {
            ciphertext: encryptedBase64,
            iv: btoa(String.fromCharCode.apply(null, Array.from(iv))),
            salt: btoa(String.fromCharCode.apply(null, Array.from(salt))),
            version: 1
        };

        return JSON.stringify(encryptedData);
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypts AES-GCM encrypted data
 */
export const decryptDatas = async (encryptedDataStr: string, masterKey: string): Promise<string> => {
    try {
        const encryptedData: EncryptedData = JSON.parse(encryptedDataStr);

        if (encryptedData.version !== 1) {
            throw new Error('Unsupported encryption version');
        }

        // Convert base64 strings back to Uint8Array
        const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
        const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
        const encryptedBuffer = str2ab(atob(encryptedData.ciphertext));

        // Derive the same key
        const key = await deriveKey(masterKey, salt);

        // Decrypt the data
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedBuffer
        );

        // Convert decrypted buffer to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Generates a master key
 */
export const generateMasterKey = async (masterPassword: string, email: string): Promise<string> => {
    const salt = generateRandomBytes(SALT_SIZE);
    const encoder = new TextEncoder();
    const combinedInput = `${masterPassword}${email}${Array.from(salt).join('')}`;
    
    const key = await deriveKey(combinedInput, salt);
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    return btoa(ab2str(exportedKey));
};

/**
 * Validates password strength
 */
export const validatePasswordStrength = (password: string): boolean => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChars
    );
};

/**
 * Generates a secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
    const charset = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*(),.?":{}|<>'
    };

    let password = '';
    const allChars = Object.values(charset).join('');

    // Ensure at least one character from each set
    password += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
    password += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
    password += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
    password += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const deriveKeys = (masterPassword: string, email: string): KeyPair => {
    try {
        // Create a consistent salt from email
        const salt = CryptoJS.SHA256(email).toString();
        
        // Derive authentication key
        const authKey = CryptoJS.PBKDF2(masterPassword, salt, {
            keySize: 256 / 32,
            iterations: 100000,
            hasher: CryptoJS.algo.SHA256
        }).toString();

        // Derive encryption key using authKey as salt
        const encryptionKey = CryptoJS.PBKDF2(masterPassword, authKey, {
            keySize: 256 / 32,
            iterations: 100000,
            hasher: CryptoJS.algo.SHA256
        }).toString();

        // Generate symmetric key
        const symmetricKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);

        return { authKey, encryptionKey, symmetricKey };
    } catch (error) {
        console.error('Key derivation error:', error);
        throw new Error('Failed to derive keys');
    }
};

export const encryptVaultKey = (symmetricKey: string, encryptionKey: string): string => {
    try {
        // Ensure consistent encoding
        const encrypted = CryptoJS.AES.encrypt(symmetricKey, encryptionKey, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        return encrypted.toString();
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt vault key');
    }
};

export const decryptVaultKey = (encryptedKey: string, encryptionKey: string): string => {
    try {
        // Add logging to debug the input
        console.log('Attempting to decrypt with:', {
            encryptedKeyLength: encryptedKey.length,
            encryptionKeyLength: encryptionKey.length
        });

        const decrypted = CryptoJS.AES.decrypt(encryptedKey, encryptionKey, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Convert to UTF8 string
        const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

        if (!decryptedStr) {
            console.error('Decryption produced empty result');
            throw new Error('Decryption resulted in empty string');
        }

        return decryptedStr;
    } catch (error) {
        console.error('Decryption error details:', error);
        throw new Error('Failed to decrypt vault key');
    }
};

export const encryptData = (data: string, symmetricKey: string): string => {
    const encrypted = CryptoJS.AES.encrypt(data, symmetricKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
};

export const decryptData = (encryptedData: string, symmetricKey: string): string => {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, symmetricKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encryptKeyData = (text: string): string => {
    const iv = CryptoJS.lib.WordArray.random(16);
    console.log("secretKey", secretKey)
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(secretKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.toString()}`; // Return IV with encrypted data
};

export const decryptKeyData = (text: string): string => {
    const [ivHex, encryptedText] = text.split(':');
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(secretKey), {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};