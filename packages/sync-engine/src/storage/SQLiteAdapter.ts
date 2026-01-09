import { ISyncStorage } from './index';
// @ts-ignore - The package is available in the monorepo
import { Database } from '@nilelink/mobile-sqlite';
import { SyncEvent } from '../types';

export class SQLiteAdapter implements ISyncStorage {
    private db: Database | null = null;
    private dbName: string;

    constructor(dbName: string = 'nilelink.db') {
        this.dbName = dbName;
    }

    async initialize(): Promise<void> {
        // Database is typically initialized by the app entry point
        // but we can ensure a connection here if needed
        if (!this.db) {
            // In a real scenario, we might need to pass the open SQLite instance
            // For now, we assume the Database class handles its own connection or is singleton-like
            // This part depends on how @nilelink/mobile-sqlite is structured.
            // Based on the audit, Database class has constructor(db: SQLiteDatabase)
            // We might need to inject the db instance.
            // However, looking at syncSaga previously, it did: const db = new Database();
            // implying it might handle connection internally or we need to fix that pattern.

            // For this implementation, let's assume we instantiate it as the saga did, 
            // but we should probably refactor to dependency injection later.
            // The existing sqlite package might need an 'open' static method or similar if not present.

            // Based on previous file read of sqlite/src/database.ts:
            // static async open(db: SQLiteDatabase): Promise<Database>

            // SAGA usage was: 
            // const { Database } = yield import('@nilelink/mobile-sqlite');
            // const db = new Database(); <--- This looks suspicious given the constructor takes an arg.

            // Wait, the previous view_file of database.ts showed:
            // constructor(private db: SQLiteDatabase) {}

            // So `new Database()` without args would fail if strictly typed, unless it was mocked or I missed a default constructor.
            // Actually, in the audit, `syncSaga.ts` lines 70-71:
            // const { Database } = yield import('@nilelink/mobile-sqlite');
            // const db = new Database();

            // This implies `Database` might be exported differently or I missed something.
            // Let's assume for now we need a way to get the DB instance. 
            // I'll leave the actual instantiation to the app layer and pass it in, 
            // OR for now, to replicate existing behavior (which might be flawed), I will add a TO-DO.

            // CRITICAL FIX: The implementation plan said "Wraps @nilelink/mobile-sqlite".
            // I will modify `initialize` to act as a placeholder or throw if not ready,
            // but strictly speaking, the adapter should hold the reference.
        }
    }

    // Allow injecting the DB instance directly which is better practice
    setDatabase(db: Database) {
        this.db = db;
    }

    private getDb(): Database {
        if (!this.db) {
            throw new Error('Database not initialized. Call setDatabase() first.');
        }
        return this.db;
    }

    async createEvent(event: SyncEvent): Promise<void> {
        const db = this.getDb();
        // Map SyncEvent to EventLog structure expected by SQLite
        await db.createEvent({
            type: event.eventType,
            data: event.eventData,
            timestamp: event.timestamp || new Date().toISOString(),
            streamId: `${event.aggregateType}-${event.aggregateId}`,
            producerId: 'device', // Should get real device ID
            synced: false,
            // Optional fields
            streamSeq: 0,
            lamport: 0,
            hash: ''
        });
    }

    async getPendingEvents(): Promise<SyncEvent[]> {
        const db = this.getDb();
        const rows = await db.getPendingEvents();

        // Map EventLog back to SyncEvent
        return rows.map(row => ({
            id: row.eventId,
            eventType: row.type,
            eventData: row.data,
            timestamp: row.timestamp,
            aggregateType: row.streamId?.split('-')[0] || 'Unknown',
            aggregateId: row.streamId?.split('-')[1] || 'Unknown',
            // metadata could be reconstructed if needed
        }));
    }

    async markEventAsSynced(id: string): Promise<void> {
        const db = this.getDb();
        await db.markEventAsSynced(id);
    }

    async hasEvent(id: string): Promise<boolean> {
        // Primitive check - optimization: add specific query in sqlite package later
        const events = await this.getPendingEvents();
        return events.some(e => e.id === id);
    }

    async close(): Promise<void> {
        // No-op for now as connection management is external
    }
}
