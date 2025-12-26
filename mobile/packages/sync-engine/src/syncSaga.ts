import { call, put, takeEvery, takeLatest, select, delay, race, fork, cancel } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import NetInfo from '@react-native-community/netinfo';

// Types
interface SyncAction {
  type: string;
  payload?: any;
}

interface OfflineQueueItem {
  id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload: any;
  timestamp: number;
  vectorClock: any;
  retryCount: number;
}

// Selectors
const getIsOnline = (state: any) => state.network.isConnected;
const getOfflineQueue = (state: any) => state.sync.offlineQueue;
const getSyncInProgress = (state: any) => state.sync.syncInProgress;

// Action Creators
export const syncActions = {
  // Network status
  networkStatusChanged: (isConnected: boolean) => ({
    type: 'SYNC/NETWORK_STATUS_CHANGED',
    payload: { isConnected }
  }),

  // Offline queue management
  queueOfflineEvent: (event: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) => ({
    type: 'SYNC/QUEUE_OFFLINE_EVENT',
    payload: event
  }),

  dequeueOfflineEvent: (eventId: string) => ({
    type: 'SYNC/DEQUEUE_OFFLINE_EVENT',
    payload: { eventId }
  }),

  // Sync operations
  startSync: () => ({ type: 'SYNC/START_SYNC' }),
  syncCompleted: (results: any) => ({
    type: 'SYNC/SYNC_COMPLETED',
    payload: results
  }),
  syncFailed: (error: any) => ({
    type: 'SYNC/SYNC_FAILED',
    payload: error
  }),

  // Conflict resolution
  conflictDetected: (conflict: any) => ({
    type: 'SYNC/CONFLICT_DETECTED',
    payload: conflict
  }),
  conflictResolved: (resolution: any) => ({
    type: 'SYNC/CONFLICT_RESOLVED',
    payload: resolution
  }),
};

// Constants
const SYNC_CONFIG = {
  maxRetries: 5,
  initialBackoff: 1000, // 1 second
  maxBackoff: 8000, // 8 seconds
  batchSize: 50,
  syncInterval: 30000, // 30 seconds
  conflictStrategy: 'LWW', // Last-Write-Wins
};

// Network monitoring saga
function* watchNetworkStatus() {
  const channel = eventChannel(emitter => {
    const unsubscribe = NetInfo.addEventListener(state => {
      emitter({ isConnected: state.isConnected });
    });

    return unsubscribe;
  });

  try {
    while (true) {
      const { isConnected } = yield take(channel);
      yield put(syncActions.networkStatusChanged(isConnected));

      if (isConnected) {
        // Start sync when coming back online
        yield put(syncActions.startSync());
      }
    }
  } finally {
    channel.close();
  }
}

// Offline event queuing saga
function* queueOfflineEvent(action: SyncAction) {
  try {
    const eventData = action.payload;
    const timestamp = Date.now();
    const vectorClock = yield select(state => state.sync.vectorClock);

    const offlineEvent: OfflineQueueItem = {
      id: `${eventData.entityType}-${eventData.entityId}-${timestamp}`,
      eventType: eventData.eventType,
      entityType: eventData.entityType,
      entityId: eventData.entityId,
      payload: eventData.payload,
      timestamp,
      vectorClock,
      retryCount: 0,
    };

    // Store in SQLite offline queue
    yield call(storeOfflineEvent, offlineEvent);

    // Update Redux state
    yield put({
      type: 'SYNC/OFFLINE_EVENT_QUEUED',
      payload: offlineEvent
    });

  } catch (error) {
    console.error('Failed to queue offline event:', error);
  }
}

// Main sync orchestrator
function* syncSaga() {
  while (true) {
    const isOnline = yield select(getIsOnline);
    const syncInProgress = yield select(getSyncInProgress);

    if (!isOnline || syncInProgress) {
      yield delay(SYNC_CONFIG.syncInterval);
      continue;
    }

    try {
      // Get offline queue
      const offlineQueue: OfflineQueueItem[] = yield select(getOfflineQueue);

      if (offlineQueue.length === 0) {
        yield delay(SYNC_CONFIG.syncInterval);
        continue;
      }

      // Process offline events in batches
      const batches = chunkArray(offlineQueue, SYNC_CONFIG.batchSize);

      for (const batch of batches) {
        const syncResult = yield call(processSyncBatch, batch);

        if (syncResult.success) {
          // Remove successfully synced events from queue
          for (const event of batch) {
            yield put(syncActions.dequeueOfflineEvent(event.id));
            yield call(removeOfflineEvent, event.id);
          }
        } else {
          // Handle failed batch - increment retry counts
          for (const event of batch) {
            if (event.retryCount < SYNC_CONFIG.maxRetries) {
              yield call(updateEventRetryCount, event.id, event.retryCount + 1);
            } else {
              // Max retries reached - mark for manual review
              yield call(markEventForManualReview, event.id);
            }
          }
        }
      }

      yield put(syncActions.syncCompleted({ syncedCount: offlineQueue.length }));

    } catch (error) {
      console.error('Sync failed:', error);
      yield put(syncActions.syncFailed(error));
    }

    yield delay(SYNC_CONFIG.syncInterval);
  }
}

// Process a batch of offline events
function* processSyncBatch(batch: OfflineQueueItem[]) {
  try {
    // Send batch to backend API
    const response = yield call(sendEventsToBackend, batch);

    if (response.success) {
      // Check for conflicts
      const conflicts = response.conflicts || [];

      for (const conflict of conflicts) {
        yield put(syncActions.conflictDetected(conflict));

        // Auto-resolve using LWW strategy
        const resolution = yield call(resolveConflictLWW, conflict);
        yield put(syncActions.conflictResolved(resolution));
      }

      return { success: true, conflicts: conflicts.length };
    } else {
      return { success: false, error: response.error };
    }

  } catch (error) {
    return { success: false, error };
  }
}

// Conflict resolution with Last-Write-Wins
function* resolveConflictLWW(conflict: any) {
  const { localData, serverData, entityType, entityId } = conflict;

  // Compare timestamps (LWW strategy)
  const localTimestamp = localData.timestamp || 0;
  const serverTimestamp = serverData.timestamp || 0;

  if (localTimestamp > serverTimestamp) {
    // Local wins - keep local version
    return {
      entityType,
      entityId,
      winner: 'local',
      resolvedData: localData,
      strategy: 'LWW'
    };
  } else {
    // Server wins - update local
    yield call(updateLocalEntity, entityType, entityId, serverData);
    return {
      entityType,
      entityId,
      winner: 'server',
      resolvedData: serverData,
      strategy: 'LWW'
    };
  }
}

// Watchers
function* watchOfflineEvents() {
  yield takeEvery('SYNC/QUEUE_OFFLINE_EVENT_REQUEST', queueOfflineEvent);
}

function* watchSyncRequests() {
  yield takeLatest('SYNC/START_SYNC', syncSaga);
}

// Root saga
export function* rootSyncSaga() {
  yield fork(watchNetworkStatus);
  yield fork(watchOfflineEvents);
  yield fork(watchSyncRequests);
}

// Utility functions
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Database operations (would be implemented with SQLite)
function* storeOfflineEvent(event: OfflineQueueItem) {
  // TODO: Implement SQLite storage
  console.log('Storing offline event:', event);
}

function* removeOfflineEvent(eventId: string) {
  // TODO: Implement SQLite removal
  console.log('Removing offline event:', eventId);
}

function* updateEventRetryCount(eventId: string, retryCount: number) {
  // TODO: Implement SQLite update
  console.log('Updating retry count for event:', eventId, retryCount);
}

function* markEventForManualReview(eventId: string) {
  // TODO: Implement manual review flag
  console.log('Marking event for manual review:', eventId);
}

function* sendEventsToBackend(batch: OfflineQueueItem[]) {
  // TODO: Implement API call
  console.log('Sending batch to backend:', batch.length, 'events');
  return { success: true, conflicts: [] };
}

function* updateLocalEntity(entityType: string, entityId: string, data: any) {
  // TODO: Implement local entity update
  console.log('Updating local entity:', entityType, entityId, data);
}
