import { SyncEvent } from '../types.js';

export interface ISyncStorage {
    /**
     * Initialize the storage (run migrations, open DB, etc)
     */
    initialize(): Promise<void>;

    /**
     * Persist a new event to local storage
     */
    createEvent(event: SyncEvent): Promise<void>;

    /**
     * Get all events that have not been synced to the server yet
     */
    getPendingEvents(): Promise<SyncEvent[]>;

    /**
     * Mark an event as successfully synced
     */
    markEventAsSynced(id: string): Promise<void>;

    /**
     * Check if an event exists
     */
    hasEvent(id: string): Promise<boolean>;

    /**
     * Close the storage connection
     */
    close(): Promise<void>;
}
