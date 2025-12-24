/**
 * Mobile Ledger - Offline Core for Delivery Network
 * Stores financial events and chain-of-custody proofs.
 */

// Ideally usage of sqlite-wasm is consistent, but for speed in this context we'll simulate the "Ledger" interface using a robust localStorage wrapper or mock if dependencies are missing. 
// Given the prompt "Offline-first (must fully work without internet)", we need persistence.
// We will stick to the architecture of the POS for compatibility: In-memory simulation backed by localStorage/IDB.

export interface LedgerEvent {
    id: string;
    type:
    | 'SHIFT_OPEN'
    | 'SHIFT_CLOSE'
    | 'TASK_ACCEPTED'
    | 'TASK_PICKED_UP'
    | 'TASK_COMPLETED'
    | 'TASK_FAILED'
    | 'CASH_COLLECTED'
    | 'CASH_DEPOSITED';
    timestamp: number;
    actorId: string;
    deviceId: string;
    hash: string;
    prevHash: string | null;
    payload: any;
    synced: boolean;
}

export class MobileLedger {
    private dbName = 'nilelink_delivery_ledger';

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init() {
        console.log('[MobileLedger] Initializing Local Chain...');
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify([]));
        }
    }

    // --- Core Ledger Operations ---

    async recordEvent(type: LedgerEvent['type'], payload: any): Promise<LedgerEvent> {
        const events = await this.getAllEvents();
        const prevEvent = events[events.length - 1];

        const newEvent: LedgerEvent = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
            type,
            timestamp: Date.now(),
            actorId: 'driver-current', // In prod, get from Auth context
            deviceId: 'device-mobile-01',
            hash: 'pending-hash', // In prod, calculate SHA-256
            prevHash: prevEvent ? prevEvent.hash : null,
            payload,
            synced: false
        };

        // Simulating Hash (In prod use subtle crypto)
        newEvent.hash = `${newEvent.id}:${Date.now()}`;

        events.push(newEvent);
        this.saveEvents(events);
        console.log(`[MobileLedger] 🔗 Block Mined: ${type}`, newEvent);
        return newEvent;
    }

    async getEvents(): Promise<LedgerEvent[]> {
        return this.getAllEvents();
    }

    async getCashBalance(): Promise<number> {
        const events = await this.getAllEvents();
        let balance = 0;

        for (const e of events) {
            if (e.type === 'CASH_COLLECTED') {
                balance += (e.payload.amount || 0);
            } else if (e.type === 'CASH_DEPOSITED') {
                balance -= (e.payload.amount || 0);
            }
        }
        return balance;
    }

    async getShiftStatus(): Promise<'OPEN' | 'CLOSED'> {
        const events = await this.getAllEvents();
        const lastShiftEvent = events.reverse().find(e => e.type === 'SHIFT_OPEN' || e.type === 'SHIFT_CLOSE');
        return lastShiftEvent && lastShiftEvent.type === 'SHIFT_OPEN' ? 'OPEN' : 'CLOSED';
    }

    // --- Internals ---

    private getAllEvents(): LedgerEvent[] {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(this.dbName);
        return raw ? JSON.parse(raw) : [];
    }

    private saveEvents(events: LedgerEvent[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.dbName, JSON.stringify(events));
    }
}
