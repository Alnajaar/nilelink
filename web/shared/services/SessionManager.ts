/**
 * Enhanced Session Manager with Role-Based Grace Periods
 * Secure offline session management with encryption
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { encryptedStorage } from '@shared/utils/EncryptedStorage';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPLIER' | 'POS_USER';

interface SessionData {
    uid: string;
    email: string;
    walletAddress: string;
    role: UserRole;
    idToken: string;
    expiresAt: number;
    cachedAt: number;
    deviceAuthorized: boolean;
    lastRefresh?: number;
}

interface GracePeriodConfig {
    SUPER_ADMIN: number; // 0ms - requires online
    ADMIN: number;       // 24 hours
    SUPPLIER: number;    // 7 days
    POS_USER: number;    // 7 days
}

const GRACE_PERIODS: GracePeriodConfig = {
    SUPER_ADMIN: 0,                          // Must be online
    ADMIN: 24 * 60 * 60 * 1000,              // 24 hours
    SUPPLIER: 7 * 24 * 60 * 60 * 1000,       // 7 days
    POS_USER: 7 * 24 * 60 * 60 * 1000,       // 7 days
};

export class SessionManager {
    private db: IDBPDatabase | null = null;

    async init(): Promise<void> {
        // Initialize encryption
        await encryptedStorage.init();

        // Open IndexedDB (use generic interface since SessionData not in schema)
        this.db = await openDB('nilelink-pos-sessions', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            },
        });
    }

    /**
     * Save session (encrypted)
     */
    async saveSession(session: SessionData): Promise<void> {
        if (!this.db) throw new Error('SessionManager not initialized');
        await encryptedStorage.setSecure(this.db, 'auth_session', session);
    }

    /**
     * Get session (decrypted)
     */
    async getSession(): Promise<SessionData | null> {
        if (!this.db) throw new Error('SessionManager not initialized');
        return await encryptedStorage.getSecure(this.db, 'auth_session');
    }

    /**
     * Validate session with role-based grace periods
     */
    async validateSession(): Promise<{
        valid: boolean;
        reason?: string;
        requiresOnline?: boolean;
    }> {
        const session = await this.getSession();

        if (!session) {
            return { valid: false, reason: 'No session found' };
        }

        // Check token expiration
        const isExpired = Date.now() > session.expiresAt;
        const gracePeriod = GRACE_PERIODS[session.role];
        const timeSinceCached = Date.now() - session.cachedAt;

        // Super admin requires online check for critical actions
        if (session.role === 'SUPER_ADMIN') {
            if (!navigator.onLine) {
                return {
                    valid: false,
                    reason: 'Super admin requires online connection',
                    requiresOnline: true,
                };
            }
            // Even if online, check if token is too stale
            if (isExpired) {
                return {
                    valid: false,
                    reason: 'Token expired, please re-login',
                    requiresOnline: true,
                };
            }
        }

        // For other roles, check grace period
        if (isExpired && timeSinceCached > gracePeriod) {
            return {
                valid: false,
                reason: `Session expired (${session.role} grace period exceeded)`,
                requiresOnline: true,
            };
        }

        // Session is valid
        return { valid: true };
    }

    /**
     * Refresh token (background, non-blocking)
     */
    async refreshToken(auth: any): Promise<boolean> {
        if (!navigator.onLine) return false;

        try {
            const session = await this.getSession();
            if (!session) return false;

            // Get new token from Firebase
            const newToken = await auth.currentUser?.getIdToken(true);
            if (!newToken) return false;

            // Update session
            session.idToken = newToken;
            session.expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
            session.lastRefresh = Date.now();

            await this.saveSession(session);

            console.log(`[SessionManager] Token refreshed for ${session.role}`);
            return true;
        } catch (error) {
            console.error('[SessionManager] Token refresh failed:', error);
            return false;
        }
    }

    /**
     * Check if action requires online verification
     */
    requiresOnlineCheck(action: string, role: UserRole): boolean {
        // Super admin critical actions
        const criticalActions = [
            'system_halt',
            'commission_update',
            'device_authorization',
            'role_change',
        ];

        if (role === 'SUPER_ADMIN' && criticalActions.includes(action)) {
            return !navigator.onLine;
        }

        return false;
    }

    /**
     * Force logout (clear session)
     */
    async logout(): Promise<void> {
        if (!this.db) return;
        await this.db.delete('settings', 'auth_session');
    }

    /**
     * Get session info (non-sensitive)
     */
    async getSessionInfo(): Promise<{
        role: UserRole;
        email: string;
        expiresIn: number;
        isOnline: boolean;
        gracePeriodRemaining: number;
    } | null> {
        const session = await this.getSession();
        if (!session) return null;

        const timeSinceCached = Date.now() - session.cachedAt;
        const gracePeriod = GRACE_PERIODS[session.role];
        const gracePeriodRemaining = Math.max(0, gracePeriod - timeSinceCached);

        return {
            role: session.role,
            email: session.email,
            expiresIn: Math.max(0, session.expiresAt - Date.now()),
            isOnline: navigator.onLine,
            gracePeriodRemaining,
        };
    }
}

// Singleton
export const sessionManager = new SessionManager();
export default sessionManager;
