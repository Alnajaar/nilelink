import { ISyncStorage } from './index';

let storageInstance: ISyncStorage | null = null;

export function setSyncStorage(storage: ISyncStorage) {
    storageInstance = storage;
}

export function getSyncStorage(): ISyncStorage {
    if (!storageInstance) {
        throw new Error('Sync Storage not initialized. Call setSyncStorage() first.');
    }
    return storageInstance;
}
