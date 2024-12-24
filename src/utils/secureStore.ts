class SecureStore {
    private static instance: SecureStore;

    private constructor() {
        // Load keys from localStorage if they exist
        this.encryptionKey = localStorage.getItem('encryptionKey');
        this.symmetricKey = localStorage.getItem('symmetricKey');
        this.vaultKey = localStorage.getItem('vaultKey');
    }

    private encryptionKey: string | null = null;
    private symmetricKey: string | null = null;
    private vaultKey: string | null = null;

    static getInstance(): SecureStore {
        if (!SecureStore.instance) {
            SecureStore.instance = new SecureStore();
        }
        return SecureStore.instance;
    }

    setKeys(encryptionKey: string, symmetricKey: string, vaultKey: string) {
        if (!encryptionKey || !symmetricKey || !vaultKey) {
            throw new Error('Cannot set empty keys');
        }
        
        this.encryptionKey = encryptionKey;
        this.symmetricKey = symmetricKey;
        this.vaultKey = vaultKey;

        // Store keys in localStorage for persistence
        localStorage.setItem('encryptionKey', encryptionKey);
        localStorage.setItem('symmetricKey', symmetricKey);
        localStorage.setItem('vaultKey', vaultKey);
        
    }

    clearKeys() {
        this.encryptionKey = null;
        this.symmetricKey = null;
        this.vaultKey = null;

        // Clear keys from localStorage
        localStorage.removeItem('encryptionKey');
        localStorage.removeItem('symmetricKey');
        localStorage.removeItem('vaultKey');
    }

    getEncryptionKey(): string {
        if (!this.encryptionKey) throw new Error('Encryption key not set');
        return this.encryptionKey;
    }

    getSymmetricKey(): string {
        if (!this.symmetricKey) throw new Error('Symmetric key not set');
        return this.symmetricKey;
    }

    getVaultKey(): string {
        if (!this.vaultKey) throw new Error('Vault key not set');
        return this.vaultKey;
    }

    setVaultKey(vaultKey: string) {
        if (!vaultKey) {
            throw new Error('Cannot set empty vault key');
        }
        this.vaultKey = vaultKey;
        localStorage.setItem('vaultKey', vaultKey);
    }

    setEncryptionKey(encryptionKey: string) {
        if (!encryptionKey) {
            throw new Error('Cannot set empty encryption key');
        }
        this.encryptionKey = encryptionKey;
        localStorage.setItem('encryptionKey', encryptionKey);
    }

    setSymmetricKey(symmetricKey: string) {
        if (!symmetricKey) {
            throw new Error('Cannot set empty symmetric key');
        }
        this.symmetricKey = symmetricKey;
        localStorage.setItem('symmetricKey', symmetricKey);
    }
}

export const secureStore = SecureStore.getInstance();