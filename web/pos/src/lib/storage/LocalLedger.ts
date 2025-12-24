/**
 * Local Ledger - SQLite Wrapper for Offline-First Event Storage
 * 
 * Stores events locally using SQL.js (SQLite in WebAssembly)
 * Enables 100% offline operation with eventual sync
 */

import initSqlJs, { Database } from 'sql.js';
import { EconomicEvent, EventMetadata } from '../events/types';
import { EventQuery } from '../events/EventEngine';

export class LocalLedger {
    private db: Database | null = null;
    private initPromise: Promise<void> | null = null;

    constructor() {
        this.initPromise = this.initialize();
    }

    /**
     * Initialize SQLite database
     */
    private async initialize(): Promise<void> {
        try {
            const SQL = await initSqlJs({
                locateFile: (file) => `https://sql.js.org/dist/${file}`,
            });

            // Try to load existing database from localStorage
            const savedDb = localStorage.getItem('nilelink_ledger');

            if (savedDb) {
                const uint8Array = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
                this.db = new SQL.Database(uint8Array);
            } else {
                this.db = new SQL.Database();
                this.createTables();
            }

            console.log('✅ Local Ledger initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Local Ledger:', error);
            throw error;
        }
    }

    /**
     * Create database schema
     */
    private createTables(): void {
        if (!this.db) return;

        // Events table
        this.db.run(`
      CREATE TABLE events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        deviceId TEXT NOT NULL,
        actorId TEXT NOT NULL,
        branchId TEXT NOT NULL,
        hash TEXT NOT NULL UNIQUE,
        previousHash TEXT,
        offline INTEGER NOT NULL,
        syncedAt INTEGER,
        version INTEGER NOT NULL,
        payload TEXT NOT NULL,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

        // Indexes for efficient queries
        this.db.run('CREATE INDEX idx_events_type ON events(type)');
        this.db.run('CREATE INDEX idx_events_timestamp ON events(timestamp)');
        this.db.run('CREATE INDEX idx_events_actor ON events(actorId)');
        this.db.run('CREATE INDEX idx_events_synced ON events(syncedAt)');
        this.db.run('CREATE INDEX idx_events_device ON events(deviceId)');

        // Metadata table
        this.db.run(`
      CREATE TABLE metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

        // Journal Entries Table (Phase 2)
        this.db.run(`
      CREATE TABLE journal_entries (
        id TEXT PRIMARY KEY,
        date INTEGER NOT NULL,
        referenceId TEXT NOT NULL,
        description TEXT NOT NULL,
        postedBy TEXT NOT NULL,
        branchId TEXT NOT NULL,
        lines TEXT NOT NULL, -- JSON array of JournalLine
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

        // Staff Reputation Table (Phase 3)
        this.db.run(`
      CREATE TABLE staff_reputation (
        staffId TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        salesCount INTEGER DEFAULT 0,
        voidCount INTEGER DEFAULT 0,
        cashVarianceTotal REAL DEFAULT 0,
        reliabilityScore REAL DEFAULT 100,
        lastUpdated INTEGER NOT NULL
      )
    `);

        // Demand Forecasts Table (Phase 4)
        this.db.run(`
      CREATE TABLE demand_forecasts (
        dateKey TEXT PRIMARY KEY, -- YYYY-MM-DD
        predictedRevenue REAL NOT NULL,
        predictedItems TEXT NOT NULL, -- JSON map of item -> qty
        confidenceScore REAL NOT NULL,
        generatedAt INTEGER NOT NULL
      )
    `);

        this.persist();
    }

    /**
     * Wait for initialization
     */
    private async ensureInitialized(): Promise<void> {
        if (this.initPromise) {
            await this.initPromise;
        }
    }

    /**
     * Insert event into local ledger
     */
    async insertEvent(event: EconomicEvent): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) throw new Error('Database not initialized');

        try {
            this.db.run(
                `INSERT INTO events (
          id, type, timestamp, deviceId, actorId, branchId,
          hash, previousHash, offline, syncedAt, version, payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    event.id,
                    event.type,
                    event.timestamp,
                    event.deviceId,
                    event.actorId,
                    event.branchId,
                    event.hash,
                    event.previousHash,
                    event.offline ? 1 : 0,
                    event.syncedAt || null,
                    event.version,
                    JSON.stringify(event.payload),
                ]
            );

            this.persist();
        } catch (error) {
            console.error('Failed to insert event:', error);
            throw error;
        }
    }

    /**
     * Get all events (chronological order)
     */
    async getAllEvents(): Promise<EconomicEvent[]> {
        await this.ensureInitialized();
        if (!this.db) return [];

        const stmt = this.db.prepare('SELECT * FROM events ORDER BY timestamp ASC');
        const events: EconomicEvent[] = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            events.push(this.rowToEvent(row));
        }

        stmt.free();
        return events;
    }

    /**
     * Get unsynced events
     */
    async getUnsyncedEvents(): Promise<EconomicEvent[]> {
        await this.ensureInitialized();
        if (!this.db) return [];

        const stmt = this.db.prepare(
            'SELECT * FROM events WHERE syncedAt IS NULL ORDER BY timestamp ASC'
        );
        const events: EconomicEvent[] = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            events.push(this.rowToEvent(row));
        }

        stmt.free();
        return events;
    }

    /**
     * Mark event as synced
     */
    async markEventSynced(eventId: string, syncTimestamp: number): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) return;

        this.db.run('UPDATE events SET syncedAt = ? WHERE id = ?', [syncTimestamp, eventId]);
        this.persist();
    }

    /**
     * Get events by type
     */
    async getEventsByType(type: string): Promise<EconomicEvent[]> {
        await this.ensureInitialized();
        if (!this.db) return [];

        const stmt = this.db.prepare('SELECT * FROM events WHERE type = ? ORDER BY timestamp ASC', [type]);
        const events: EconomicEvent[] = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            events.push(this.rowToEvent(row));
        }

        stmt.free();
        return events;
    }

    /**
     * Get events by time range
     */
    async getEventsByTimeRange(startTime: number, endTime: number): Promise<EconomicEvent[]> {
        await this.ensureInitialized();
        if (!this.db) return [];

        const stmt = this.db.prepare(
            'SELECT * FROM events WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC',
            [startTime, endTime]
        );
        const events: EconomicEvent[] = [];

        while (stmt.step()) {
            const row = stmt.getAsObject();
            events.push(this.rowToEvent(row));
        }

        stmt.free();
        return events;
    }

    /**
   * Get last event hash for chain continuation
     */
    async getLastEventHash(): Promise<string | null> {
        await this.ensureInitialized();
        if (!this.db) return null;

        const stmt = this.db.prepare('SELECT hash FROM events ORDER BY timestamp DESC LIMIT 1');

        if (stmt.step()) {
            const row = stmt.getAsObject();
            const hash = row.hash as string;
            stmt.free();
            return hash;
        }

        stmt.free();
        return null;
    }

    /**
     * Get event count
     */
    async getEventCount(): Promise<number> {
        await this.ensureInitialized();
        if (!this.db) return 0;

        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM events');
        stmt.step();
        const row = stmt.getAsObject();
        const count = row.count as number;
        stmt.free();

        return count;
    }

    /**
     * Convert database row to EconomicEvent
     */
    private rowToEvent(row: any): EconomicEvent {
        return {
            id: row.id,
            type: row.type,
            timestamp: row.timestamp,
            deviceId: row.deviceId,
            actorId: row.actorId,
            branchId: row.branchId,
            hash: row.hash,
            previousHash: row.previousHash,
            offline: row.offline === 1,
            syncedAt: row.syncedAt || undefined,
            version: row.version,
            payload: JSON.parse(row.payload),
        } as EconomicEvent;
    }

    /**
     * Persist database to localStorage
     */
    private persist(): void {
        if (!this.db) return;

        try {
            const data = this.db.export();
            const base64 = btoa(String.fromCharCode(...data));
            localStorage.setItem('nilelink_ledger', base64);
        } catch (error) {
            console.error('Failed to persist ledger:', error);
        }
    }

    /**
     * Clear all data (use with caution!)
     */
    async clear(): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) return;

        this.db.run('DELETE FROM events');
        this.db.run('DELETE FROM metadata');
        this.persist();
    }

    /**
     * Export database as JSON
     */
    async exportToJSON(): Promise<string> {
        const events = await this.getAllEvents();
        return JSON.stringify(events, null, 2);
    }

    /**
     * Get database statistics
     */
    async getStats(): Promise<{
        totalEvents: number;
        unsyncedEvents: number;
        databaseSize: string;
        oldestEvent: number | null;
        newestEvent: number | null;
    }> {
        await this.ensureInitialized();
        if (!this.db) {
            return {
                totalEvents: 0,
                unsyncedEvents: 0,
                databaseSize: '0 KB',
                oldestEvent: null,
                newestEvent: null,
            };
        }

        const totalEvents = await this.getEventCount();
        const unsyncedEvents = (await this.getUnsyncedEvents()).length;

        const sizeStmt = this.db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()');
        sizeStmt.step();
        const sizeRow = sizeStmt.getAsObject();
        const sizeBytes = (sizeRow.size as number) || 0;
        sizeStmt.free();

        const timeStmt = this.db.prepare('SELECT MIN(timestamp) as oldest, MAX(timestamp) as newest FROM events');
        timeStmt.step();
        const timeRow = timeStmt.getAsObject();
        const oldestEvent = (timeRow.oldest as number) || null;
        const newestEvent = (timeRow.newest as number) || null;
        timeStmt.free();

        return {
            totalEvents,
            unsyncedEvents,
            databaseSize: `${(sizeBytes / 1024).toFixed(2)} KB`,
            oldestEvent,
            newestEvent,
        };
    }

    // --- Journal Methods ---

    async insertJournalEntry(entry: any): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) return;

        this.db.run(
            `INSERT INTO journal_entries (id, date, referenceId, description, postedBy, branchId, lines) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [entry.id, entry.date, entry.referenceId, entry.description, entry.postedBy, entry.branchId, JSON.stringify(entry.lines)]
        );
        this.persist();
    }

    async getJournalEntries(limit = 100): Promise<any[]> {
        await this.ensureInitialized();
        if (!this.db) return [];

        const stmt = this.db.prepare('SELECT * FROM journal_entries ORDER BY date DESC LIMIT ?', [limit]);
        const entries = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            entries.push({ ...row, lines: JSON.parse(row.lines as string) });
        }
        stmt.free();
        return entries;
    }

    // --- Reputation Methods ---

    async updateStaffReputation(staffId: string, name: string, updates: any): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) return;

        // Check availability
        const check = this.db.prepare('SELECT * FROM staff_reputation WHERE staffId = ?', [staffId]);
        if (check.step()) {
            // Update
            const current = check.getAsObject();
            const newSales = (current.salesCount as number) + (updates.salesCount || 0);
            const newVoids = (current.voidCount as number) + (updates.voidCount || 0);
            const newVariance = (current.cashVarianceTotal as number) + (updates.cashVariance || 0);

            // Simple scoring logic: Start at 100. -5 per void. -1 per 10 EGP variance. +1 per 10 sales.
            let reliability = 100 + (newSales / 10) - (newVoids * 5) - (Math.abs(newVariance) / 10);
            reliability = Math.min(100, Math.max(0, reliability));

            this.db.run(
                `UPDATE staff_reputation SET salesCount=?, voidCount=?, cashVarianceTotal=?, reliabilityScore=?, lastUpdated=? WHERE staffId=?`,
                [newSales, newVoids, newVariance, reliability, Date.now(), staffId]
            );
        } else {
            // Insert
            this.db.run(
                `INSERT INTO staff_reputation (staffId, name, salesCount, voidCount, cashVarianceTotal, reliabilityScore, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [staffId, name, updates.salesCount || 0, updates.voidCount || 0, updates.cashVariance || 0, 100, Date.now()]
            );
        }
        check.free();
        this.persist();
    }

    async getStaffReputation(staffId: string): Promise<any> {
        await this.ensureInitialized();
        if (!this.db) return null;
        const stmt = this.db.prepare('SELECT * FROM staff_reputation WHERE staffId = ?', [staffId]);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
    }

    async getAllStaffReputation(): Promise<any[]> {
        await this.ensureInitialized();
        if (!this.db) return [];
        const stmt = this.db.prepare('SELECT * FROM staff_reputation ORDER BY reliabilityScore DESC');
        const res = [];
        while (stmt.step()) res.push(stmt.getAsObject());
        stmt.free();
        return res;
    }

    // --- Forecast Methods ---

    async saveForecast(forecast: any): Promise<void> {
        await this.ensureInitialized();
        if (!this.db) return;

        this.db.run(`INSERT OR REPLACE INTO demand_forecasts (dateKey, predictedRevenue, predictedItems, confidenceScore, generatedAt) VALUES (?, ?, ?, ?, ?)`,
            [forecast.dateKey, forecast.predictedRevenue, JSON.stringify(forecast.predictedItems), forecast.confidenceScore, Date.now()]
        );
        this.persist();
    }

    async getForecast(dateKey: string): Promise<any> {
        await this.ensureInitialized();
        if (!this.db) return null;
        const stmt = this.db.prepare('SELECT * FROM demand_forecasts WHERE dateKey = ?', [dateKey]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return { ...row, predictedItems: JSON.parse(row.predictedItems as string) };
        }
        stmt.free();
        return null;
    }
}
