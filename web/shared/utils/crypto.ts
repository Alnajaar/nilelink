/**
 * NileLink Cryptographic Primitives (Quantum-Resistant / Suite B)
 * 
 * This module provides a centralized, secure interface for all cryptographic operations
 * within the Economic OS. It mandates the use of modern algorithms and forbids
 * legacy primitives (MD5, SHA1).
 */

// --- 1. Hashing (SHA-256) ---

/**
 * Computes a SHA-256 hash of the input string.
 * @param message The input string to hash.
 * @returns A hex string representation of the hash.
 */
export async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// --- 2. Randomness (CSPRNG) ---

/**
 * Generates a cryptographically secure random UUID (v4).
 * Uses window.crypto.randomUUID() where available.
 */
export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments (unlikely in modern web, but safe)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generates a secure random token of specified byte length (default 32).
 * @param length Bytes length.
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// --- 3. Signing (Simulation for MVP) ---

/**
 * Simulates signing a payload with a private key.
 * In a full implementation, this would use Ed25519 or P-256 via SubtleCrypto.
 */
export async function signPayload(payload: any, privateKey: string): Promise<string> {
    // For MVP/Proto, we hash the payload + key. 
    // TODO: Upgrade to proper asymmetric signature scheme.
    const content = JSON.stringify(payload);
    return sha256(content + privateKey);
}

/**
 * Verifies a signature.
 */
export async function verifySignature(payload: any, signature: string, publicKey: string): Promise<boolean> {
    // For MVP/Proto simulation
    const content = JSON.stringify(payload);
    const computed = await sha256(content + publicKey); // treating public key as shared secret for logic mock
    return computed === signature;
}
