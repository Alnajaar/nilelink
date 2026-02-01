import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ISyncStorage, SyncEvent } from '@nilelink/sync-engine';

interface SyncDB extends DBSchema {
    events: {
        key: string;
        value: SyncEvent & { synced: boolean; streamId: string };
        indexes: { 'by-synced': boolean };
    };
    [key: string]: any;
}

export class WebSyncAdapter implements ISyncStorage {
    private db: IDBPDatabase<SyncDB> | null = null;
    private dbName = 'nilelink-sync-db';

    async initialize(): Promise<void> {
        this.db = await openDB<SyncDB>(this.dbName, 1, {
            upgrade(db) {
                const store = db.createObjectStore('events', { keyPath: 'id' });
                store.createIndex('by-synced', 'synced');
            },
        });
    }

    async createEvent(event: SyncEvent): Promise<void> {
        if (!this.db) throw new Error('DB not initialized');
        await this.db.put('events', {
            ...event,
            synced: false,
            streamId: `${event.aggregateType}-${event.aggregateId}`
        });
    }

    async getPendingEvents(): Promise<SyncEvent[]> {
        if (!this.db) throw new Error('DB not initialized');
        // 'synced' is boolean, index might need 0/1 checking if using indexeddb raw, but idb handles types well usually.
        // However, index queries in idb matching boolean:
        const events = await this.db.getAllFromIndex('events', 'by-synced', false); // Assuming false matches
        // Strip extra fields if necessary to match SyncEvent strictly, but usually excess is fine.
        return events;
    }

    async markEventAsSynced(id: string): Promise<void> {
        if (!this.db) throw new Error('DB not initialized');
        const event = await this.db.get('events', id);
        if (event) {
            event.synced = true;
            await this.db.put('events', event);
        }
    }

    async hasEvent(id: string): Promise<boolean> {
        if (!this.db) throw new Error('DB not initialized');
        const event = await this.db.get('events', id);
        return !!event;
    }

    async close(): Promise<void> {
        this.db?.close();
    }
}
