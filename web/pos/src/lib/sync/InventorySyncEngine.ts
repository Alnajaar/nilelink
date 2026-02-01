/**
 * Inventory Sync Engine - Real-time Inventory Synchronization
 * 
 * Handles synchronization of inventory data between local storage and blockchain/IPFS
 * Ensures consistency across all POS terminals and online systems
 */

import { productInventoryEngine } from '../core/ProductInventoryEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { EventEngine } from '../events/EventEngine';
import { EventType } from '../events/types';

export class InventorySyncEngine {
    private localLedger: LocalLedger;
    private eventEngine: EventEngine;
    private syncInterval: NodeJS.Timeout | null = null;
    private isSyncing = false;
    private lastSyncTimestamp: number = 0;

    constructor(localLedger: LocalLedger, eventEngine: EventEngine) {
        this.localLedger = localLedger;
        this.eventEngine = eventEngine;
        this.initializeSync();
    }

    /**
     * Initialize periodic sync
     */
    private initializeSync(): void {
        // Start periodic sync every 30 seconds
        this.syncInterval = setInterval(async () => {
            if (!this.isSyncing) {
                await this.performSync();
            }
        }, 30000);
    }

    /**
     * Perform synchronization cycle
     */
    async performSync(): Promise<void> {
        if (this.isSyncing) return;

        this.isSyncing = true;
        const startTime = Date.now();

        try {
            console.log('🔄 Starting inventory synchronization...');

            // Sync local changes to network
            await this.syncLocalChanges();

            // Pull updates from network
            await this.pullNetworkUpdates();

            // Update last sync timestamp
            this.lastSyncTimestamp = Date.now();

            const duration = Date.now() - startTime;
            console.log(`✅ Inventory sync completed in ${duration}ms`);

            // Emit sync completion event
            await this.eventEngine.createEvent(
                EventType.SYSTEM_EVENT,
                'SYSTEM',
                {
                    eventType: 'INVENTORY_SYNC_COMPLETED',
                    duration,
                    timestamp: this.lastSyncTimestamp
                }
            );

        } catch (error) {
            console.error('❌ Inventory sync failed:', error);

            await this.eventEngine.createEvent(
                EventType.SYSTEM_EVENT,
                'SYSTEM',
                {
                    eventType: 'INVENTORY_SYNC_FAILED',
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: Date.now()
                }
            );
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Sync local inventory changes to network
     */
    private async syncLocalChanges(): Promise<void> {
        // Get pending inventory transactions from local ledger
        const pendingTransactions = await this.localLedger.getPendingInventoryTransactions();

        if (pendingTransactions.length === 0) {
            console.log('📋 No pending inventory transactions to sync');
            return;
        }

        console.log(`📤 Syncing ${pendingTransactions.length} inventory transactions...`);

        // Process each transaction
        for (const transaction of pendingTransactions) {
            try {
                // Add to product inventory engine
                await productInventoryEngine.addInventoryTransaction({
                    productId: transaction.productId,
                    variantId: transaction.variantId,
                    type: transaction.type as any,
                    quantity: transaction.quantity,
                    userId: transaction.userId,
                    reference: transaction.reference,
                    reason: transaction.reason
                });

                // Mark as synced
                await this.localLedger.markInventoryTransactionSynced(transaction.id);

                console.log(`✅ Synced transaction ${transaction.id}`);

            } catch (error) {
                console.error(`❌ Failed to sync transaction ${transaction.id}:`, error);
                // Continue with other transactions
            }
        }
    }

    /**
     * Pull updates from network/central system (The Graph + IPFS)
     */
    private async pullNetworkUpdates(): Promise<void> {
        console.log('📥 Pulling network inventory updates...');

        try {
            // Get businessId from local configuration or persistence
            // In NileLink, the POS is tied to a specific restaurant/branch address
            const configRes = await this.localLedger.get('SYSTEM_CONFIG');
            const businessId = configRes?.businessId;

            if (!businessId) {
                console.warn('⏭️ Skipping network inventory updates - no businessId found in SYSTEM_CONFIG');
                return;
            }

            console.log(`🔗 Syncing inventory with decentralized catalog for: ${businessId}`);

            // This method in productInventoryEngine already handles Graph -> IPFS -> Local Cache flow
            await productInventoryEngine.loadBusinessProducts(businessId);

            console.log('✅ Network inventory updates pulled successfully');
        } catch (error) {
            console.warn('⚠️ Failed to pull network updates:', error);
            // Non-blocking: Offline mode is acceptable
        }
    }

    /**
     * Force immediate synchronization
     */
    async forceSync(): Promise<void> {
        console.log('⚡ Force synchronization requested');
        await this.performSync();
    }

    /**
     * Get sync status
     */
    getSyncStatus(): {
        isSyncing: boolean;
        lastSync: number;
        nextSync: number;
    } {
        const now = Date.now();
        const nextSync = this.lastSyncTimestamp + 30000; // 30 seconds interval

        return {
            isSyncing: this.isSyncing,
            lastSync: this.lastSyncTimestamp,
            nextSync: nextSync > now ? nextSync : now
        };
    }

    /**
     * Shutdown the sync engine
     */
    shutdown(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        console.log('🛑 InventorySyncEngine shutdown');
    }
}