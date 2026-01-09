/**
 * NileLink Event Engine - Core Event Processor
 * 
 * Handles creation, validation, and chaining of economic events.
 * Ensures cryptographic integrity through SHA-256 hash linking.
 */

import { v4 as uuidv4 } from 'uuid';
import { EconomicEvent, BaseEvent, EventType, EventMetadata } from './types';
import { LocalLedger } from '../storage/LocalLedger';

export class EventEngine {
    private deviceId: string;
    private branchId: string;
    private lastEventHash: string | null = null;
    private ledger: LocalLedger;
    private defaultActorId: string = 'system';
    private listeners: ((event: EconomicEvent) => void)[] = [];

    constructor(deviceId: string, branchId: string, ledger: LocalLedger) {
        this.deviceId = deviceId;
        this.branchId = branchId;
        this.ledger = ledger;
    }

    /**
     * Create a new economic event with full integrity checks
     */
    async createEvent<T extends EconomicEvent>(
        type: EventType,
        actorId: string | null,
        payload: T['payload']
    ): Promise<T> {
        const timestamp = Date.now();
        const id = uuidv4();
        const finalActorId = actorId || this.defaultActorId;

        const baseEvent: BaseEvent = {
            id,
            type,
            timestamp,
            deviceId: this.deviceId,
            actorId: finalActorId,
            branchId: this.branchId,
            hash: '', // Will be calculated
            previousHash: this.lastEventHash,
            offline: !navigator.onLine,
            version: 1,
        };

        const event = {
            ...baseEvent,
            payload,
        } as T;

        // Calculate hash
        event.hash = await this.calculateEventHash(event);

        // Update chain
        this.lastEventHash = event.hash;

        // Persist to local ledger
        await this.ledger.insertEvent(event);

        // Notify listeners (Phase 12 Ecosystem Intelligence)
        this.notifyListeners(event);

        return event;
    }

    private notifyListeners(event: EconomicEvent): void {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (err) {
                console.error('Error in event listener:', err);
            }
        });
    }

    /**
     * Subscribe to events
     */
    onEvent(listener: (event: EconomicEvent) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Calculate SHA-256 hash of event for integrity
     */
    private async calculateEventHash(event: Partial<EconomicEvent>): Promise<string> {
        const hashInput = JSON.stringify({
            id: event.id,
            type: event.type,
            timestamp: event.timestamp,
            deviceId: event.deviceId,
            actorId: event.actorId,
            branchId: event.branchId,
            previousHash: event.previousHash,
            payload: event.payload,
        });

        const msgBuffer = new TextEncoder().encode(hashInput);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

    /**
     * Verify event integrity
     */
    async verifyEvent(event: EconomicEvent): Promise<boolean> {
        const calculatedHash = await this.calculateEventHash(event);
        return calculatedHash === event.hash;
    }

    /**
     * Verify event chain integrity
     */
    async verifyEventChain(events: EconomicEvent[]): Promise<boolean> {
        if (events.length === 0) return true;

        // Check first event (genesis)
        if (events[0].previousHash !== null) {
            console.error('First event should have null previousHash');
            return false;
        }

        // Verify each event's hash
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            // Verify hash integrity
            const isValid = await this.verifyEvent(event);
            if (!isValid) {
                console.error(`Event ${event.id} has invalid hash`);
                return false;
            }

            // Verify chain linkage
            if (i > 0) {
                const previousEvent = events[i - 1];
                if (event.previousHash !== previousEvent.hash) {
                    console.error(`Event ${event.id} has broken chain link`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Set last event hash (for loading existing chain)
     */
    setLastEventHash(hash: string | null): void {
        this.lastEventHash = hash;
    }

    /**
     * Set default actor for auto-injecting into events
     */
    setDefaultActor(actorId: string): void {
        this.defaultActorId = actorId;
    }

    /**
     * Get current chain state
     */
    getChainState(): { deviceId: string; branchId: string; lastHash: string | null } {
        return {
            deviceId: this.deviceId,
            branchId: this.branchId,
            lastHash: this.lastEventHash,
        };
    }
}

/**
 * Event Query Helpers
 */
export class EventQuery {
    /**
     * Filter events by type
     */
    static filterByType(events: EconomicEvent[], type: EventType): EconomicEvent[] {
        return events.filter(e => e.type === type);
    }

    /**
     * Filter events by actor
     */
    static filterByActor(events: EconomicEvent[], actorId: string): EconomicEvent[] {
        return events.filter(e => e.actorId === actorId);
    }

    /**
     * Filter events by time range
     */
    static filterByTimeRange(
        events: EconomicEvent[],
        startTime: number,
        endTime: number
    ): EconomicEvent[] {
        return events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    }

    /**
     * Get events for a specific shift
     */
    static getShiftEvents(events: EconomicEvent[], shiftId: string): EconomicEvent[] {
        return events.filter(e => {
            const payload: any = e.payload;
            return payload.shiftId === shiftId;
        });
    }

    /**
     * Calculate metadata for event collection
     */
    static calculateMetadata(events: EconomicEvent[]): EventMetadata {
        if (events.length === 0) {
            return {
                eventCount: 0,
                firstEventTimestamp: 0,
                lastEventTimestamp: 0,
                deviceCount: 0,
                branchCount: 0,
                syncStatus: 'synced',
            };
        }

        const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
        const deviceIds = new Set(events.map(e => e.deviceId));
        const branchIds = new Set(events.map(e => e.branchId));
        const hasPendingSync = events.some(e => !e.syncedAt);

        return {
            eventCount: events.length,
            firstEventTimestamp: sortedEvents[0].timestamp,
            lastEventTimestamp: sortedEvents[sortedEvents.length - 1].timestamp,
            deviceCount: deviceIds.size,
            branchCount: branchIds.size,
            syncStatus: hasPendingSync ? 'pending' : 'synced',
        };
    }
}

/**
 * Event Replay Engine
 * Reconstruct state from event history
 */
export class EventReplay {
    /**
     * Calculate current inventory state from events
     */
    static calculateInventoryState(events: EconomicEvent[]): Map<string, number> {
        const inventory = new Map<string, number>();

        for (const event of events) {
            const payload: any = event.payload;

            if (event.type === EventType.INVENTORY_ADDED && payload.ingredientId) {
                const current = inventory.get(payload.ingredientId) || 0;
                inventory.set(payload.ingredientId, current + payload.quantity);
            } else if (event.type === EventType.INVENTORY_DEDUCTED && payload.ingredientId) {
                const current = inventory.get(payload.ingredientId) || 0;
                inventory.set(payload.ingredientId, current - payload.quantity);
            }
        }

        return inventory;
    }

    /**
     * Calculate cash state from events
     */
    static calculateCashState(events: EconomicEvent[]): number {
        let cashBalance = 0;

        for (const event of events) {
            const payload: any = event.payload;

            if (event.type === EventType.PAYMENT_COLLECTED_CASH && payload.amount) {
                cashBalance += payload.amount;
            } else if (event.type === EventType.CASH_BANK_DEPOSIT && payload.amount) {
                cashBalance -= payload.amount;
            }
        }

        return cashBalance;
    }

    /**
     * Calculate daily revenue from events
     */
    static calculateDailyRevenue(events: EconomicEvent[], date: Date): number {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const dayEvents = EventQuery.filterByTimeRange(
            events,
            startOfDay.getTime(),
            endOfDay.getTime()
        );

        let revenue = 0;
        for (const event of dayEvents) {
            const payload: any = event.payload;

            if (
                (event.type === EventType.PAYMENT_COLLECTED_CASH ||
                    event.type === EventType.PAYMENT_COLLECTED_CARD ||
                    event.type === EventType.PAYMENT_COLLECTED_DIGITAL) &&
                payload.amount
            ) {
                revenue += payload.amount;
            }
        }

        return revenue;
    }
}
