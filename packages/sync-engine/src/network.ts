import type { EventEnvelope, VectorClock } from './types';
import type { SyncPush, SyncPull } from './syncSaga';

const API_BASE = 'https://api.nilelink.app';

export const createCloudflarePush = (): SyncPush => {
    return async ({ streamId, events }) => {
        // We transform our envelopes to the flat structure the API expects in v0.1
        const payload = events.map(e => ({
            id: e.eventId,
            type: e.eventType,
            entityType: streamId.split(':')[0] || 'unknown',
            entityId: streamId.split(':')[1] || 'unknown',
            payload: e.payload,
            deviceId: e.producerId
        }));

        const response = await fetch(`${API_BASE}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Sync push failed');
        }
    };
};

export const createCloudflarePull = (): SyncPull => {
    return async ({ streamId, known }) => {
        // In v0.1: Pulling events from D1 via the API
        const response = await fetch(`${API_BASE}/events?streamId=${streamId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data.events || [];
    };
};
