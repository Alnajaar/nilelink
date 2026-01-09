/**
 * Sync Worker - Background Event Synchronization
 * 
 * Automatically syncs local events to Cloudflare D1 when online
 * Handles conflict resolution via event timestamps
 */

import { LocalLedger } from '../storage/LocalLedger';
import { EconomicEvent } from '../events/types';

export class SyncWorker {
    private ledger: LocalLedger;
    private apiEndpoint: string;
    private syncInterval: number = 30000; // 30 seconds
    private intervalId: NodeJS.Timeout | null = null;
    private isSyncing: boolean = false;

    constructor(ledger: LocalLedger, apiEndpoint: string) {
        this.ledger = ledger;
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Start automatic sync process
     */
    start(): void {
        console.log('🔄 Sync Worker started');

        // Immediate sync on start
        this.syncNow();

        // Periodic sync
        this.intervalId = setInterval(() => {
            this.syncNow();
        }, this.syncInterval);

        // Sync when connection restored
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored, syncing...');
            this.syncNow();
        });

        window.addEventListener('offline', () => {
            console.log('📡 Connection lost, entering offline mode');
        });
    }

    /**
     * Stop sync worker
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('⏸️  Sync Worker stopped');
    }

    /**
     * Trigger immediate sync
     */
    async syncNow(): Promise<{ success: boolean; syncedCount: number; error?: string }> {
        if (this.isSyncing) {
            return { success: false, syncedCount: 0, error: 'Sync already in progress' };
        }

        if (!navigator.onLine) {
            return { success: false, syncedCount: 0, error: 'No internet connection' };
        }

        this.isSyncing = true;
        let retryCount = 0;
        const maxRetries = 5;

        try {
            const unsyncedEvents = await this.ledger.getUnsyncedEvents();

            if (unsyncedEvents.length === 0) {
                this.isSyncing = false;
                return { success: true, syncedCount: 0 };
            }

            console.log(`📤 Syncing ${unsyncedEvents.length} events...`);

            // Try Batch Sync first
            try {
                await this.performBatchSync(unsyncedEvents);
                console.log(`✅ Batch Synced ${unsyncedEvents.length} events`);
                this.isSyncing = false;
                return { success: true, syncedCount: unsyncedEvents.length };
            } catch (batchError) {
                console.warn('⚠️ Batch sync failed, attempting individual item recovery', batchError);

                // Fallback: Item-by-Item Sync (Partial Recovery)
                let successCount = 0;
                for (const event of unsyncedEvents) {
                    try {
                        await this.performSingleSync(event);
                        successCount++;
                    } catch (singleError) {
                        console.error(`❌ Failed to sync event ${event.id}`, singleError);
                        // If 409 Conflict, we might want to mark it as 'conflicted' in DB to stop retrying forever
                        // For now we skips it.
                    }
                }

                this.isSyncing = false;
                return { success: successCount > 0, syncedCount: successCount, error: 'Batch failed, partial recovery executed' };
            }

        } catch (error) {
            console.error('❌ Sync error:', error);
            this.isSyncing = false;

            // Retry logic (Exponential Backoff if needed, but usually we just wait for next interval)
            // But if we want aggressive retry:
            if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000;
                setTimeout(() => this.syncNow(), delay);
            }

            return {
                success: false,
                syncedCount: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private async performBatchSync(events: EconomicEvent[]): Promise<void> {
        const response = await fetch(`${this.apiEndpoint}/events/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events }),
        });

        if (!response.ok) {
            throw new Error(`Batch sync failed: ${response.status} ${response.statusText}`);
        }

        const syncTimestamp = Date.now();
        for (const event of events) {
            await this.ledger.markEventSynced(event.id, syncTimestamp);
        }
    }

    private async performSingleSync(event: EconomicEvent): Promise<void> {
        const response = await fetch(`${this.apiEndpoint}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event }),
        });

        if (!response.ok) {
            // Check for specific error codes like 409
            if (response.status === 409) {
                // Conflict! 
                // Strategy: Mark as synced but flag as 'resolved_conflict' or similar if we had that field.
                // For now, we assume server rejected it. We mark it synced to stop loop? 
                // Risk: Data loss. 
                // Better: Leave unsynced but 'ignored' in memory? 
                // Best: The server *accepted* it but noted conflict. If server returns 409, it usually means "I have this already" or "Invalid state".
                // If "I have it", we mark synced.
                if (response.statusText.includes("Duplicate")) {
                    await this.ledger.markEventSynced(event.id, Date.now());
                    return;
                }
            }
            throw new Error(`Sync failed for ${event.id}: ${response.status}`);
        }

        await this.ledger.markEventSynced(event.id, Date.now());
    }

    /**
     * Get sync status
     */
    async getSyncStatus(): Promise<{
        isOnline: boolean;
        isSyncing: boolean;
        unsyncedCount: number;
        lastSyncAttempt?: number;
    }> {
        const unsyncedEvents = await this.ledger.getUnsyncedEvents();

        return {
            isOnline: navigator.onLine,
            isSyncing: this.isSyncing,
            unsyncedCount: unsyncedEvents.length,
        };
    }
}
