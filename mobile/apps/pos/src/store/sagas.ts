
import { delay, put, takeLatest, call } from 'redux-saga/effects';
import { createSyncSaga, type EventEnvelope, type VectorClock } from '@nilelink/mobile-sync-engine';
import { Database, type EventLog as DbEventLog } from '@nilelink/mobile-sqlite';
import { getDatabase } from '../services/database';
import { POS_SYNC_REQUESTED, posActions } from './posSlice';

// Helper type to carry 'synced' status through the sync engine
type EnrichedEnvelope = EventEnvelope & { _synced?: boolean };

// Mapper: DB EventLog -> EventEnvelope
function toEnvelope(log: DbEventLog): EnrichedEnvelope {
  const data = typeof log.data === 'string' ? JSON.parse(log.data) : log.data;
  // Fallback if data is just the payload (legacy) or full envelope structure
  const payload = data.payload || data;

  return {
    eventId: log.eventId,
    eventType: log.type,
    // Schema version might not be in older logs, default to '0.1'
    schemaVersion: (data.schemaVersion as any) || '0.1',
    streamId: log.streamId || 'default',
    producerId: log.producerId || 'unknown',
    streamSeq: log.streamSeq || 0,
    lamport: log.lamport || 0,
    occurredAt: log.timestamp,
    // Actor/VectorClock stored in data
    actor: data.actor || { type: 'SYSTEM', id: 'unknown' },
    payload: payload,
    vectorClock: data.vectorClock || {},
    hash: log.hash || '',
    _synced: log.synced
  };
}

// Mapper: EventEnvelope -> DB EventLog
function toLog(env: EnrichedEnvelope): Omit<DbEventLog, 'synced'> & { synced: boolean } {
  return {
    eventId: env.eventId,
    type: env.eventType,
    timestamp: env.occurredAt,
    streamId: env.streamId,
    producerId: env.producerId,
    streamSeq: env.streamSeq,
    lamport: env.lamport,
    hash: env.hash,
    data: {
      payload: env.payload,
      actor: env.actor,
      vectorClock: env.vectorClock,
      schemaVersion: env.schemaVersion
    },
    synced: env._synced === true
  };
}

// Create the store adapter
function createSQLiteStore(db: Database) {
  return {
    async getAll(streamId: string) {
      const logs = await db.getAllEvents(streamId);
      return logs.map(toEnvelope);
    },

    async replace(streamId: string, events: EventEnvelope[]) {
      // @ts-ignore - casting enriched envelope
      const logs = events.map(e => toLog(e as EnrichedEnvelope));
      await db.replaceEvents(streamId, logs as any);
    },

    async getPendingUploads(streamId: string) {
      const logs = await db.getPendingEvents();
      return logs
        .filter((l: DbEventLog) => l.streamId === streamId)
        .map(toEnvelope);
    },

    async markUploaded(eventIds: string[]) {
      await db.markEventsAsUploaded(eventIds);
    },

    async getVectorClock(streamId: string) {
      return await db.getVectorClock(streamId);
    },

    async setVectorClock(streamId: string, vc: VectorClock) {
      await db.setVectorClock(streamId, vc);
    }
  };
}

// Mock Network Calls (Replace with real API)
const api = {
  pull: async (streamId: string, known: VectorClock): Promise<EnrichedEnvelope[]> => {
    // console.log('Pulling events for', streamId, 'known:', known);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));
    // Return empty list for now (or mock data)
    return [];
  },

  push: async (streamId: string, events: EventEnvelope[]) => {
    // console.log('Pushing events for', streamId, events.length);
    await new Promise(r => setTimeout(r, 500));
    // Success
  }
};

function* createBoundSyncSaga() {
  const db: Database = getDatabase();
  const restaurantId = 'restaurant:demo'; // Should come from state

  const store = createSQLiteStore(db);

  const runner = createSyncSaga(
    {
      streamId: restaurantId,
      store,
      pull: async ({ streamId, known }) => {
        const events = await api.pull(streamId, known);
        return events.map(e => ({ ...e, _synced: true }));
      },
      push: async ({ streamId, events }) => {
        await api.push(streamId, events);
      }
    },
    {
      started: (streamId: string) => ({ ...posActions.syncStarted(), payload: { streamId } }),
      progressed: (streamId: string, stage: string) => ({ ...posActions.syncProgress(stage), payload: { streamId, stage } }),
      finished: (streamId: string) => ({ ...posActions.syncFinished(), payload: { streamId } }),
      failed: (streamId: string, error: string) => ({ ...posActions.syncFailed(error), payload: { streamId, error } })
    }
  );

  yield* runner();
}

export function* rootSaga() {
  yield takeLatest(POS_SYNC_REQUESTED, function* () {
    try {
      yield* createBoundSyncSaga();
    } catch (error) {
      console.error('Sync failed in rootSaga:', error);
      yield put(posActions.syncFailed(String(error)));
    }
  });
}
