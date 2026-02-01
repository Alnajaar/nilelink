/**
 * Versioned Sync Engine with Conflict Resolution
 * Handles offline queuing and timestamp-based merging
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { ethers } from 'ethers';

interface VersionedObject {
    id: string;
    version: number;
    lastModified: number;
    modifiedBy: string; // wallet address
    data: any;
}

interface SyncOperation {
    id: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    entityType: 'product' | 'storeProduct' | 'order';
    entity: VersionedObject;
    status: 'pending' | 'synced' | 'failed' | 'conflict';
    retryCount: number;
    createdAt: number;
    error?: string;
}

interface ConflictResolution {
    localVersion: VersionedObject;
    remoteVersion: VersionedObject;
    resolution: 'keep_local' | 'keep_remote' | 'merge' | 'manual';
}

interface VersionedSyncDB extends DBSchema {
    products: {
        key: string;
        value: VersionedObject;
    };
    storeProducts: {
        key: string;
        value: VersionedObject;
    };
    orders: {
        key: string;
        value: VersionedObject;
    };
    syncQueue: {
        key: string;
        value: SyncOperation;
        indexes: { 'by-status': string };
    };
}

export class VersionedSyncEngine {
    private db: IDBPDatabase<VersionedSyncDB> | null = null;
    private walletAddress: string;

    constructor(walletAddress: string) {
        this.walletAddress = walletAddress;
    }

    async init(): Promise<void> {
        this.db = await openDB<VersionedSyncDB>('nilelink-versioned-sync', 1, {
            upgrade(db) {
                // Products
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'id' });
                }

                // Store Products
                if (!db.objectStoreNames.contains('storeProducts')) {
                    db.createObjectStore('storeProducts', { keyPath: 'id' });
                }

                // Orders
                if (!db.objectStoreNames.contains('orders')) {
                    db.createObjectStore('orders', { keyPath: 'id' });
                }

                // Sync Queue
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    queueStore.createIndex('by-status', 'status');
                }
            },
        });
    }

    /**
     * Create or update versioned object
     */
    async upsert(
        entityType: 'product' | 'storeProduct' | 'order',
        data: any
    ): Promise<VersionedObject> {
        if (!this.db) throw new Error('DB not initialized');

        const existing = await this.db.get(entityType + 's' as any, data.id);

        const versioned: VersionedObject = {
            id: data.id,
            version: existing ? existing.version + 1 : 1,
            lastModified: Date.now(),
            modifiedBy: this.walletAddress,
            data,
        };

        await this.db.put(entityType + 's' as any, versioned);

        // Queue for sync
        await this.queueSync('UPDATE', entityType, versioned);

        return versioned;
    }

    /**
     * Queue operation for sync
     */
    private async queueSync(
        operation: 'CREATE' | 'UPDATE' | 'DELETE',
        entityType: 'product' | 'storeProduct' | 'order',
        entity: VersionedObject
    ): Promise<void> {
        if (!this.db) return;

        const syncOp: SyncOperation = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            operation,
            entityType,
            entity,
            status: 'pending',
            retryCount: 0,
            createdAt: Date.now(),
        };

        await this.db.put('syncQueue', syncOp);
    }

    /**
     * Sync pending operations
     */
    async sync(): Promise<{
        synced: number;
        failed: number;
        conflicts: ConflictResolution[];
    }> {
        if (!this.db || !navigator.onLine) {
            return { synced: 0, failed: 0, conflicts: [] };
        }

        const tx = this.db.transaction('syncQueue', 'readonly');
        const index = tx.store.index('by-status');
        const pendingOps = await index.getAll('pending');

        const results = {
            synced: 0,
            failed: 0,
            conflicts: [] as ConflictResolution[],
        };

        for (const op of pendingOps) {
            try {
                // Simulate sync to IPFS or blockchain
                const result = await this.syncOperation(op);

                if (result.conflict) {
                    results.conflicts.push(result.conflict);
                    op.status = 'conflict';
                } else {
                    op.status = 'synced';
                    results.synced++;
                }

                await this.db.put('syncQueue', op);
            } catch (error: any) {
                op.status = op.retryCount >= 3 ? 'failed' : 'pending';
                op.retryCount++;
                op.error = error.message;
                results.failed++;

                await this.db.put('syncQueue', op);
            }
        }

        return results;
    }

    /**
     * Sync single operation
     */
    private async syncOperation(op: SyncOperation): Promise<{
        success: boolean;
        conflict?: ConflictResolution;
    }> {
        // Simulate fetching remote version
        const remoteVersion = await this.fetchRemoteVersion(op.entityType, op.entity.id);

        if (!remoteVersion) {
            // No remote version, safe to sync
            await this.uploadToIPFS(op.entity);
            return { success: true };
        }

        // Check for conflicts
        if (remoteVersion.version > op.entity.version) {
            // Remote is newer, conflict detected
            const resolution = this.resolveConflict(op.entity, remoteVersion);
            return { success: false, conflict: resolution };
        }

        if (remoteVersion.lastModified > op.entity.lastModified) {
            // Remote was modified more recently
            const resolution = this.resolveConflict(op.entity, remoteVersion);
            return { success: false, conflict: resolution };
        }

        // Local version is newer, safe to sync
        await this.uploadToIPFS(op.entity);
        return { success: true };
    }

    /**
     * Resolve conflict (timestamp-based)
     */
    private resolveConflict(
        local: VersionedObject,
        remote: VersionedObject
    ): ConflictResolution {
        // Strategy: Most recent modification wins
        if (local.lastModified > remote.lastModified) {
            return {
                localVersion: local,
                remoteVersion: remote,
                resolution: 'keep_local',
            };
        }

        return {
            localVersion: local,
            remoteVersion: remote,
            resolution: 'keep_remote',
        };
    }

    /**
     * Fetch remote version (from IPFS or blockchain)
     */
    private async fetchRemoteVersion(
        entityType: string,
        id: string
    ): Promise<VersionedObject | null> {
        // TODO: Implement IPFS fetch
        // For now, return null (no remote version)
        return null;
    }

    /**
     * Upload to IPFS
     */
    private async uploadToIPFS(entity: VersionedObject): Promise<string> {
        // TODO: Implement IPFS upload
        console.log('[VersionedSync] Would upload to IPFS:', entity);
        return 'QmHash...';
    }

    /**
     * Get sync queue status
     */
    async getSyncStatus(): Promise<{
        pending: number;
        synced: number;
        failed: number;
        conflicts: number;
    }> {
        if (!this.db) return { pending: 0, synced: 0, failed: 0, conflicts: 0 };

        const all = await this.db.getAll('syncQueue');

        return {
            pending: all.filter(op => op.status === 'pending').length,
            synced: all.filter(op => op.status === 'synced').length,
            failed: all.filter(op => op.status === 'failed').length,
            conflicts: all.filter(op => op.status === 'conflict').length,
        };
    }

    /**
     * Get conflicts for manual resolution
     */
    async getConflicts(): Promise<SyncOperation[]> {
        if (!this.db) return [];

        const tx = this.db.transaction('syncQueue', 'readonly');
        const index = tx.store.index('by-status');
        return index.getAll('conflict');
    }

    /**
     * Resolve conflict manually
     */
    async resolveConflictManually(
        opId: string,
        resolution: 'keep_local' | 'keep_remote'
    ): Promise<void> {
        if (!this.db) return;

        const op = await this.db.get('syncQueue', opId);
        if (!op) return;

        if (resolution === 'keep_local') {
            // Upload local version
            await this.uploadToIPFS(op.entity);
            op.status = 'synced';
        } else {
            // Fetch and apply remote version
            const remote = await this.fetchRemoteVersion(op.entityType, op.entity.id);
            if (remote) {
                await this.db.put(op.entityType + 's' as any, remote);
            }
            op.status = 'synced';
        }

        await this.db.put('syncQueue', op);
    }
}

export default VersionedSyncEngine;
