/**
 * NileLink RFID Reader Manager
 * 
 * Handles real-time RFID tag scanning and inventory.
 * Bridges IRFIDReaderHAL with the EASManager for theft prevention.
 */

import { EventEngine } from '../events/EventEngine';
import { IRFIDReaderHAL } from './hal/HAL';
import { EventType } from '../events/types';

export class RFIDManager {
    private eventEngine: EventEngine;
    private hal: IRFIDReaderHAL;
    private isScanning: boolean = false;
    private scanIntervalId: NodeJS.Timeout | null = null;

    constructor(
        eventEngine: EventEngine,
        hal: IRFIDReaderHAL
    ) {
        this.eventEngine = eventEngine;
        this.hal = hal;
    }

    /**
     * Start continuous RFID inventory scanning
     */
    startScanning(intervalMs: number = 2000): void {
        if (this.isScanning) return;
        this.isScanning = true;

        this.scanIntervalId = setInterval(async () => {
            await this.performInventory();
        }, intervalMs);

        console.log('[RFID] Scanning started.');
    }

    /**
     * Stop RFID scanning
     */
    stopScanning(): void {
        if (this.scanIntervalId) {
            clearInterval(this.scanIntervalId);
            this.scanIntervalId = null;
        }
        this.isScanning = false;
        console.log('[RFID] Scanning stopped.');
    }

    /**
     * Perform a single inventory pass
     */
    private async performInventory(): Promise<void> {
        try {
            const tags = await this.hal.inventoryTags();
            if (tags.length > 0) {
                // Emit event for EASManager to consume
                await this.eventEngine.createEvent(
                    EventType.EAS_TAG_UNLOCKED, // Re-using or extending event types
                    'RFIDManager',
                    {
                        action: 'inventory',
                        tags,
                        timestamp: Date.now()
                    }
                );
            }
        } catch (error) {
            console.error('RFID Inventory failed:', error);
        }
    }

    /**
     * Write data to a tag (e.g. associating it with a product at the factory or warehouse)
     */
    async programTag(tagId: string, productId: string): Promise<void> {
        await this.hal.writeTag(tagId, productId);
        console.log(`[RFID] Tag ${tagId} programmed with Product ${productId}`);
    }
}
