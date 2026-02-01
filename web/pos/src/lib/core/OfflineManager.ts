/**
 * NileLink Offline Manager
 *
 * Ensures system resilience with seamless offline/online transitions:
 * - Offline transaction processing with local storage
 * - Intelligent data synchronization on reconnection
 * - Conflict resolution for concurrent offline edits
 * - Partial offline capabilities maintenance
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { AlertManager } from '../security/AlertManager';
import {
    EventType,
    EconomicEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface OfflineTransaction {
    id: string;
    transactionId: string;
    events: EconomicEvent[];
    createdAt: number;
    synced: boolean;
    syncAttempts: number;
    lastSyncAttempt?: number;
    errorMessage?: string;
}

export interface SyncConflict {
    id: string;
    localEvent: EconomicEvent;
    remoteEvent: EconomicEvent;
    resolution?: 'local' | 'remote' | 'merge' | 'manual';
    resolvedAt?: number;
}

export interface SyncStatus {
    isOnline: boolean;
    lastSyncTime?: number;
    pendingTransactions: number;
    syncQueueLength: number;
    unresolvedConflicts: number;
    networkLatency?: number;
}

export class OfflineManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private alertManager: AlertManager;
    private offlineTransactions: Map<string, OfflineTransaction> = new Map();
    private syncConflicts: Map<string, SyncConflict> = new Map();
    private syncStatus: SyncStatus;
    private syncWorker?: Worker;

    // Configuration
    private readonly MAX_OFFLINE_TRANSACTIONS = 1000;
    private readonly SYNC_RETRY_INTERVAL = 30000; // 30 seconds
    private readonly MAX_SYNC_RETRIES = 5;
    private readonly OFFLINE_STORAGE_KEY = 'nilelink_offline_transactions';

    constructor(
        eventEngine: EventEngine,
        ledger: LocalLedger,
        alertManager: AlertManager
    ) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.alertManager = alertManager;

        this.syncStatus = {
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            pendingTransactions: 0,
            syncQueueLength: 0,
            unresolvedConflicts: 0
        };

        if (typeof window !== 'undefined') {
            this.loadOfflineTransactions();
            this.setupNetworkListeners();
            this.startPeriodicSync();
        }
    }

    /**
     * Store transaction for offline processing
     */
    async storeOfflineTransaction(
        transactionId: string,
        events: EconomicEvent[]
    ): Promise<void> {
        const offlineTx: OfflineTransaction = {
            id: uuidv4(),
            transactionId,
            events: [...events], // Deep copy
            createdAt: Date.now(),
            synced: false,
            syncAttempts: 0
        };

        this.offlineTransactions.set(transactionId, offlineTx);
        this.syncStatus.pendingTransactions = this.offlineTransactions.size;

        // Persist to localStorage
        this.saveOfflineTransactions();

        console.log(`📱 Stored offline transaction: ${transactionId}`);

        // Notify about offline operation
        await this.alertManager.createAlert(
            'low',
            'system',
            'Offline Transaction Stored',
            `Transaction ${transactionId} stored for later synchronization`,
            { transactionId, eventCount: events.length },
            'OfflineManager'
        );
    }

    /**
     * Check if system should operate in offline mode
     */
    isOfflineMode(): boolean {
        return !this.syncStatus.isOnline;
    }

    /**
     * Get current sync status
     */
    getSyncStatus(): SyncStatus {
        return { ...this.syncStatus };
    }

    /**
     * Attempt to sync all pending transactions
     */
    async syncPendingTransactions(): Promise<{
        synced: number;
        failed: number;
        conflicts: number;
    }> {
        if (this.isOfflineMode()) {
            throw new Error('Cannot sync while offline');
        }

        const ipfsService = (await import('@shared/services/IPFSService')).default;
        const web3Service = (await import('@shared/services/Web3Service')).default;

        if (!web3Service.isWalletConnected()) {
            console.warn('⚠️ OfflineManager: Wallet not connected. Sync deferred.');
            return { synced: 0, failed: 0, conflicts: 0 };
        }

        let synced = 0;
        let failed = 0;
        let conflicts = 0;

        const pendingTxs = Array.from(this.offlineTransactions.values())
            .filter(tx => !tx.synced);

        for (const tx of pendingTxs) {
            try {
                console.log(`📤 Decentralized Sync: Uploading offline transaction ${tx.transactionId} to IPFS...`);

                // Step 1: Upload to IPFS
                const ipfsResult = await ipfsService.uploadJSON(tx, `offline-tx-${tx.transactionId}`);
                if (!ipfsResult) throw new Error('IPFS Upload Failed');

                // Step 2: Anchor to Blockchain
                const txHash = await web3Service.anchorEventBatch('branch_001', ipfsResult.cid);
                if (!txHash) throw new Error('Blockchain Anchoring Failed');

                console.log(`⛓️ Decentralized Sync Success: CID ${ipfsResult.cid}, TX ${txHash}`);

                synced++;
                tx.synced = true;
                tx.lastSyncAttempt = Date.now();

            } catch (error) {
                failed++;
                tx.syncAttempts++;
                tx.errorMessage = error instanceof Error ? error.message : 'Unknown error';
                tx.lastSyncAttempt = Date.now();
            }
        }

        // Clean up synced transactions
        for (const [txId, tx] of this.offlineTransactions) {
            if (tx.synced) {
                this.offlineTransactions.delete(txId);
            } else if (tx.syncAttempts >= this.MAX_SYNC_RETRIES) {
                // Mark as failed after max retries
                tx.synced = false;
                this.offlineTransactions.delete(txId);

                await this.alertManager.createAlert(
                    'medium',
                    'system',
                    'Sync Failed - Max Retries',
                    `Transaction ${tx.transactionId} failed to sync after ${this.MAX_SYNC_RETRIES} attempts`,
                    { transactionId: tx.transactionId, error: tx.errorMessage },
                    'OfflineManager'
                );
            }
        }

        this.syncStatus.pendingTransactions = this.offlineTransactions.size;
        this.syncStatus.lastSyncTime = Date.now();
        this.saveOfflineTransactions();

        return { synced, failed, conflicts };
    }

    /**
     * Sync a single transaction (mock implementation)
     */
    private async syncTransaction(tx: OfflineTransaction): Promise<{
        success: boolean;
        conflict?: boolean;
        conflictData?: any;
        error?: string;
    }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));

        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate
            return {
                success: false,
                error: 'Network timeout'
            };
        }

        // Simulate occasional conflicts
        if (Math.random() < 0.05) { // 5% conflict rate
            return {
                success: false,
                conflict: true,
                conflictData: {
                    remoteVersion: 'modified_version',
                    conflictReason: 'concurrent_modification'
                }
            };
        }

        // Success - in real implementation, send to server
        console.log(`🔄 Synced transaction: ${tx.transactionId}`);
        return { success: true };
    }

    /**
     * Handle sync conflicts
     */
    private async handleSyncConflict(tx: OfflineTransaction, conflictData: any): Promise<void> {
        const conflict: SyncConflict = {
            id: uuidv4(),
            localEvent: tx.events[0], // Simplified - use first event
            remoteEvent: conflictData.remoteVersion,
            resolution: 'manual' // Require manual resolution
        };

        this.syncConflicts.set(conflict.id, conflict);
        this.syncStatus.unresolvedConflicts = this.syncConflicts.size;

        await this.alertManager.createAlert(
            'high',
            'system',
            'Sync Conflict Detected',
            `Conflict detected for transaction ${tx.transactionId}. Manual resolution required.`,
            { transactionId: tx.transactionId, conflictId: conflict.id },
            'OfflineManager'
        );
    }

    /**
     * Resolve a sync conflict
     */
    async resolveConflict(
        conflictId: string,
        resolution: 'local' | 'remote' | 'merge'
    ): Promise<boolean> {
        const conflict = this.syncConflicts.get(conflictId);
        if (!conflict) return false;

        conflict.resolution = resolution;
        conflict.resolvedAt = Date.now();

        // Apply resolution
        // In real implementation, this would re-sync with chosen version

        this.syncConflicts.delete(conflictId);
        this.syncStatus.unresolvedConflicts = this.syncConflicts.size;

        return true;
    }

    /**
     * Get offline capabilities status
     */
    getOfflineCapabilities(): {
        canProcessSales: boolean;
        canProcessRefunds: boolean;
        canPrintReceipts: boolean;
        canAccessInventory: boolean;
        cachedInventoryExpiry?: number;
    } {
        const now = Date.now();
        const cachedInventoryExpiry = now + (24 * 60 * 60 * 1000); // 24 hours

        return {
            canProcessSales: true, // Always allow sales
            canProcessRefunds: false, // Require online for refunds
            canPrintReceipts: true, // Can print locally
            canAccessInventory: true, // Cached inventory available
            cachedInventoryExpiry
        };
    }

    /**
     * Setup network connectivity listeners
     */
    private setupNetworkListeners(): void {
        window.addEventListener('online', async () => {
            console.log('🌐 Network connection restored');
            this.syncStatus.isOnline = true;

            // Immediate sync attempt
            try {
                const result = await this.syncPendingTransactions();
                if (result.synced > 0) {
                    await this.alertManager.createAlert(
                        'low',
                        'system',
                        'Offline Sync Completed',
                        `Successfully synced ${result.synced} offline transactions`,
                        result,
                        'OfflineManager'
                    );
                }
            } catch (error) {
                console.error('Failed to sync on reconnection:', error);
            }
        });

        window.addEventListener('offline', () => {
            console.log('📴 Network connection lost');
            this.syncStatus.isOnline = false;

            this.alertManager.createAlert(
                'medium',
                'system',
                'Network Connection Lost',
                'System operating in offline mode. Transactions will be synced when connection is restored.',
                {},
                'OfflineManager'
            );
        });
    }

    /**
     * Start periodic sync attempts
     */
    private startPeriodicSync(): void {
        setInterval(async () => {
            if (this.syncStatus.isOnline && this.offlineTransactions.size > 0) {
                try {
                    await this.syncPendingTransactions();
                } catch (error) {
                    console.error('Periodic sync failed:', error);
                }
            }
        }, this.SYNC_RETRY_INTERVAL);
    }

    /**
     * Load offline transactions from storage
     */
    private loadOfflineTransactions(): void {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
            if (saved) {
                const transactions: OfflineTransaction[] = JSON.parse(saved);
                for (const tx of transactions) {
                    this.offlineTransactions.set(tx.transactionId, tx);
                }
                this.syncStatus.pendingTransactions = this.offlineTransactions.size;
            }
        } catch (error) {
            console.error('Failed to load offline transactions:', error);
        }
    }

    /**
     * Save offline transactions to storage
     */
    private saveOfflineTransactions(): void {
        if (typeof window === 'undefined') return;

        try {
            const transactions = Array.from(this.offlineTransactions.values());
            localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error('Failed to save offline transactions:', error);
        }
    }

    /**
     * Get pending offline transactions
     */
    getPendingTransactions(): OfflineTransaction[] {
        return Array.from(this.offlineTransactions.values())
            .filter(tx => !tx.synced)
            .sort((a, b) => a.createdAt - b.createdAt);
    }

    /**
     * Get unresolved sync conflicts
     */
    getUnresolvedConflicts(): SyncConflict[] {
        return Array.from(this.syncConflicts.values())
            .filter(c => !c.resolvedAt)
            .sort((a, b) => a.localEvent.timestamp - b.localEvent.timestamp);
    }

    /**
     * Force online mode (for testing)
     */
    forceOnlineMode(): void {
        this.syncStatus.isOnline = true;
    }

    /**
     * Force offline mode (for testing)
     */
    forceOfflineMode(): void {
        this.syncStatus.isOnline = false;
    }
}