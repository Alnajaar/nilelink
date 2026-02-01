/**
 * Web3 Sync Worker - Decentralized Background Event Synchronization
 * 
 * Automatically batches local events, uploads to IPFS, and anchors CIDs 
 * to the NileLink smart contracts (FraudDetection.sol) when online.
 * 
 * Fulfills "100% Decentralized" requirement.
 */

import { LocalLedger } from '../storage/LocalLedger';
import { EconomicEvent } from '../events/types';
import ipfsService from '@shared/services/IPFSService';
import web3Service from '@shared/services/Web3Service';

export class Web3SyncWorker {
    private ledger: LocalLedger;
    private branchId: string;
    private syncInterval: number = 60000; // 60 seconds (longer for blockchain anchoring)
    private intervalId: NodeJS.Timeout | null = null;
    private isSyncing: boolean = false;

    constructor(ledger: LocalLedger, branchId: string) {
        this.ledger = ledger;
        this.branchId = branchId;
    }

    /**
     * Start automatic decentralized sync process
     */
    start(): void {
        console.log('🌐 Web3 Sync Worker started (Decentralized Mode)');

        // Immediate sync on start
        this.syncNow();

        // Periodic sync
        this.intervalId = setInterval(() => {
            this.syncNow();
        }, this.syncInterval);

        // Sync when connection restored
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('🌐 100% Decentralized Network restored, syncing to IPFS/Web3...');
                this.syncNow();
            });
        }
    }

    /**
     * Stop sync worker
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('⏸️ Web3 Sync Worker stopped');
    }

    /**
     * Trigger immediate decentralized sync
     */
    async syncNow(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
        if (this.isSyncing) {
            return { success: false, syncedCount: 0, error: 'Sync already in progress' };
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return { success: false, syncedCount: 0, error: 'No internet connection' };
        }

        // Blockchain requirement: Wallet must be connected to sign the anchor transaction
        if (!web3Service.isWalletConnected()) {
            console.warn('⚠️ Web3 Sync: Wallet not connected. Anchoring deferred.');
            return { success: false, syncedCount: 0, error: 'Wallet not connected' };
        }

        this.isSyncing = true;

        try {
            const unsyncedEvents = await this.ledger.getUnsyncedEvents();

            if (unsyncedEvents.length === 0) {
                this.isSyncing = false;
                return { success: true, syncedCount: 0 };
            }

            console.log(`📤 Decentralized Batch: Syncing ${unsyncedEvents.length} events to IPFS...`);

            // Step 1: Upload batch to IPFS
            const batchMetadata = {
                branchId: this.branchId,
                eventCount: unsyncedEvents.length,
                timestamp: Date.now(),
                network: web3Service.getCurrentNetwork(),
                events: unsyncedEvents
            };

            const ipfsResult = await ipfsService.uploadJSON(batchMetadata, `pos-event-batch-${Date.now()}`);

            if (!ipfsResult) {
                throw new Error('IPFS Batch Upload Failed');
            }

            console.log(`📦 IPFS Batch Anchored: CID ${ipfsResult.cid}`);

            // Step 2: Anchor IPFS CID to Blockchain (FraudDetection.sol)
            // This creates a 100% decentralized, verifiable audit trail
            const txHash = await web3Service.anchorEventBatch(this.branchId, ipfsResult.cid);

            if (!txHash) {
                throw new Error('Blockchain Anchoring Failed');
            }

            console.log(`⛓️ Blockchain Anchor Success: TX ${txHash}`);

            // Step 3: Mark events as synced in local ledger with Web3 metadata
            const syncTimestamp = Date.now();
            for (const event of unsyncedEvents) {
                // We could extend LocalLedger to store IPFS CID and TX Hash per event
                await this.ledger.markEventSynced(event.id, syncTimestamp);
            }

            this.isSyncing = false;
            return { success: true, syncedCount: unsyncedEvents.length };

        } catch (error: any) {
            console.error('❌ Web3 Sync error:', error);
            this.isSyncing = false;

            return {
                success: false,
                syncedCount: 0,
                error: error instanceof Error ? error.message : 'Unknown decentralized sync error'
            };
        }
    }

    /**
     * Get sync status
     */
    async getSyncStatus() {
        const unsyncedEvents = await this.ledger.getUnsyncedEvents();

        return {
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
            isSyncing: this.isSyncing,
            unsyncedCount: unsyncedEvents.length,
            isWalletConnected: web3Service.isWalletConnected(),
            network: web3Service.getCurrentNetwork()
        };
    }
}
