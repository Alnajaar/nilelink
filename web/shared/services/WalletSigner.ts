/**
 * Wallet Transaction Signer with Ephemeral Keys
 * Secure offline transaction signing without exposing permanent private keys
 */

import { ethers } from 'ethers';
import { encryptedStorage } from '@shared/utils/EncryptedStorage';

interface SignedTransaction {
    id: string;
    data: any;
    signature: string;
    signerAddress: string;
    timestamp: number;
    nonce: number;
}

export class WalletSigner {
    private provider?: ethers.BrowserProvider;
    private signer?: ethers.Signer;
    private ephemeralSigner?: ethers.Wallet;
    private db: any;

    async init(db: any): Promise<void> {
        this.db = db;

        // Connect to wallet provider
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
        }

        // Load or create ephemeral signing key
        await this.loadEphemeralKey();
    }

    /**
     * Load ephemeral key from encrypted storage or create new one
     */
    private async loadEphemeralKey(): Promise<void> {
        if (!this.db) return;

        // Try to load existing ephemeral key
        const storedKey = await encryptedStorage.getSecure(this.db, 'ephemeral_key');

        if (storedKey && storedKey.expiresAt > Date.now()) {
            // Use existing key if not expired
            this.ephemeralSigner = new ethers.Wallet(storedKey.privateKey);
            console.log('[WalletSigner] Loaded ephemeral key:', this.ephemeralSigner.address);
        } else {
            // Create new ephemeral key (valid for 24 hours)
            this.ephemeralSigner = ethers.Wallet.createRandom();

            await encryptedStorage.setSecure(this.db, 'ephemeral_key', {
                privateKey: this.ephemeralSigner.privateKey,
                address: this.ephemeralSigner.address,
                createdAt: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            });

            console.log('[WalletSigner] Created new ephemeral key:', this.ephemeralSigner.address);
        }
    }

    /**
     * Sign transaction data (offline-safe)
     */
    async signTransaction(data: any): Promise<SignedTransaction> {
        if (!this.ephemeralSigner) {
            throw new Error('Ephemeral signer not initialized');
        }

        // Get nonce from storage (for replay protection)
        const nonce = await this.getNextNonce();

        // Create transaction object
        const txData = {
            ...data,
            nonce,
            timestamp: Date.now(),
        };

        // Sign with ephemeral key
        const message = JSON.stringify(txData);
        const signature = await this.ephemeralSigner.signMessage(message);

        const signedTx: SignedTransaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: txData,
            signature,
            signerAddress: this.ephemeralSigner.address,
            timestamp: txData.timestamp,
            nonce,
        };

        // Increment nonce
        await this.incrementNonce();

        return signedTx;
    }

    /**
     * Verify transaction signature
     */
    async verifySignature(signedTx: SignedTransaction): Promise<boolean> {
        try {
            const message = JSON.stringify(signedTx.data);
            const recovered = ethers.verifyMessage(message, signedTx.signature);

            return recovered === signedTx.signerAddress;
        } catch (error) {
            console.error('[WalletSigner] Verification failed:', error);
            return false;
        }
    }

    /**
     * Sign with permanent wallet (for critical operations)
     */
    async signWithPermanentWallet(data: any): Promise<string> {
        if (!this.signer) {
            throw new Error('Permanent wallet not connected');
        }

        const message = JSON.stringify(data);
        return await this.signer.signMessage(message);
    }

    /**
     * Get next nonce for replay protection
     */
    private async getNextNonce(): Promise<number> {
        if (!this.db) return 0;

        const currentNonce = await encryptedStorage.getSecure(this.db, 'tx_nonce');
        return (currentNonce || 0) + 1;
    }

    /**
     * Increment nonce after signing
     */
    private async incrementNonce(): Promise<void> {
        if (!this.db) return;

        const currentNonce = await encryptedStorage.getSecure(this.db, 'tx_nonce');
        await encryptedStorage.setSecure(this.db, 'tx_nonce', (currentNonce || 0) + 1);
    }

    /**
     * Get ephemeral key info
     */
    async getEphemeralKeyInfo(): Promise<{
        address: string;
        expiresAt: number;
        expiresIn: number;
    } | null> {
        if (!this.db) return null;

        const storedKey = await encryptedStorage.getSecure(this.db, 'ephemeral_key');
        if (!storedKey) return null;

        return {
            address: storedKey.address,
            expiresAt: storedKey.expiresAt,
            expiresIn: Math.max(0, storedKey.expiresAt - Date.now()),
        };
    }

    /**
     * Rotate ephemeral key (security best practice)
     */
    async rotateEphemeralKey(): Promise<void> {
        // Force create new key
        this.ephemeralSigner = ethers.Wallet.createRandom();

        await encryptedStorage.setSecure(this.db, 'ephemeral_key', {
            privateKey: this.ephemeralSigner.privateKey,
            address: this.ephemeralSigner.address,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        });

        console.log('[WalletSigner] Rotated ephemeral key:', this.ephemeralSigner.address);
    }
}

export default WalletSigner;
