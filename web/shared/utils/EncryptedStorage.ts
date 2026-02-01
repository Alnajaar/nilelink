/**
 * Encrypted Session Storage
 * AES-256 encryption for cached auth sessions and wallet data
 */

class EncryptedStorage {
    private encryptionKey: CryptoKey | null = null;

    /**
     * Initialize encryption key (derived from device fingerprint + password)
     */
    async init(password?: string): Promise<void> {
        const deviceId = await this.getDeviceFingerprint();
        const keyMaterial = password ? `${deviceId}-${password}` : deviceId;

        const encoder = new TextEncoder();
        const keyData = encoder.encode(keyMaterial);

        // Derive encryption key using PBKDF2
        const importedKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        this.encryptionKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('nilelink-pos-v1'),
                iterations: 100000,
                hash: 'SHA-256',
            },
            importedKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Generate device fingerprint for encryption key derivation
     */
    private async getDeviceFingerprint(): Promise<string> {
        const components = [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset().toString(),
            screen.colorDepth.toString(),
            screen.width.toString() + 'x' + screen.height.toString(),
        ].join('|');

        const encoder = new TextEncoder();
        const data = encoder.encode(components);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Encrypt data
     */
    async encrypt(data: any): Promise<string> {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }

        const encoder = new TextEncoder();
        const plaintext = encoder.encode(JSON.stringify(data));

        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Encrypt
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            plaintext
        );

        // Combine IV + ciphertext
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Decrypt data
     */
    async decrypt(encryptedData: string): Promise<any> {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not initialized');
        }

        // Decode base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extract IV and ciphertext
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            ciphertext
        );

        const decoder = new TextDecoder();
        const plaintext = decoder.decode(decrypted);
        return JSON.parse(plaintext);
    }

    /**
     * Store encrypted data in IndexedDB
     */
    async setSecure(db: any, key: string, value: any): Promise<void> {
        const encrypted = await this.encrypt(value);
        await db.put('settings', { key, value: encrypted });
    }

    /**
     * Retrieve and decrypt data from IndexedDB
     */
    async getSecure(db: any, key: string): Promise<any | null> {
        const result = await db.get('settings', key);
        if (!result) return null;

        try {
            return await this.decrypt(result.value);
        } catch (error) {
            console.error('[EncryptedStorage] Decryption failed:', error);
            return null;
        }
    }
}

// Singleton
export const encryptedStorage = new EncryptedStorage();
export default encryptedStorage;
