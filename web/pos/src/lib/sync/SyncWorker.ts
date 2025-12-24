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

        try {
            const unsyncedEvents = await this.ledger.getUnsyncedEvents();

            if (unsyncedEvents.length === 0) {
                this.isSyncing = false;
                return { success: true, syncedCount: 0 };
            }

            console.log(`📤 Syncing ${unsyncedEvents.length} events...`);

            // Send events to server
            const response = await fetch(`${this.apiEndpoint}/events/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events: unsyncedEvents }),
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Mark events as synced
            const syncTimestamp = Date.now();
            for (const event of unsyncedEvents) {
                await this.ledger.markEventSynced(event.id, syncTimestamp);
            }

            console.log(`✅ Synced ${unsyncedEvents.length} events`);

            this.isSyncing = false;
            return { success: true, syncedCount: unsyncedEvents.length };

        } catch (error) {
            console.error('❌ Sync error:', error);
            this.isSyncing = false;
            return {
                success: false,
                syncedCount: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
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
