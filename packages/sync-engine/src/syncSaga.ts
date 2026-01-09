import { call, put, takeLatest, select, take, race, delay, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import NetInfo from '@react-native-community/netinfo';
import { syncActions } from './store/syncSlice';
import { SyncEvent, SyncError } from './types/sync.types';
import { loadSyncEnvironment, validateSyncEnvironment } from './config';

// ============================================================================
// NILELINK SYNC PROTOCOL v4.2S
// ============================================================================

/**
 * Creates a channel to monitor network connectivity via NetInfo
 */
function createNetworkChannel() {
  return eventChannel(emit => {
    const unsubscribe = NetInfo.addEventListener(state => {
      emit({
        isConnected: !!state.isConnected,
        timestamp: new Date()
      });
    });
    return unsubscribe;
  });
}

/**
 * Saga to watch for network connectivity changes
 */
function* watchNetworkConnectivity() {
  const networkChannel = yield call(createNetworkChannel);
  try {
    while (true) {
      const networkEvent = yield take(networkChannel);
      if (networkEvent.isConnected) {
        yield put(syncActions.networkOnline());
        yield put(syncActions.startSync()); // Auto-trigger sync on reconnect
      } else {
        yield put(syncActions.networkOffline());
      }
    }
  } finally {
    networkChannel.close();
  }
}

/**
 * Core event synchronization logic
 */
function* syncEvents() {
  try {
    yield put(syncActions.syncStarted());

    // 1. Get auth and configuration
    const token = yield select((state: any) => state.auth?.token);
    const config = loadSyncEnvironment();
    const validation = validateSyncEnvironment(config);

    if (!validation.isValid) {
      throw new Error(`Invalid sync configuration: ${validation.errors.join(', ')}`);
    }

    const apiUrl = config.API_URL;

    // 2. Load pending events from Storage Adapter
    let pendingEvents = yield select((state: any) => state.sync?.pendingEvents || []);

    if (pendingEvents.length === 0) {
      try {
        const { getSyncStorage } = yield import('./storage/instance');
        const storage = getSyncStorage();
        const storedEvents = yield call([storage, 'getPendingEvents']);

        if (storedEvents && storedEvents.length > 0) {
          // Hydrate Redux with stored events
          for (const event of storedEvents) {
            yield put(syncActions.queueEvent(event));
          }
          pendingEvents = storedEvents;
        }
      } catch (storageError) {
        console.warn('Failed to load events from storage:', storageError);
      }
    }

    if (pendingEvents.length > 0) {
      try {
        yield put(syncActions.syncProgress({ message: 'Uploading local events...', progress: 20 }));

        // 3. Batch events and send to backend
        const batches = [];
        for (let i = 0; i < pendingEvents.length; i += config.BATCH_SIZE) {
          batches.push(pendingEvents.slice(i, i + config.BATCH_SIZE));
        }

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          yield put(syncActions.syncProgress({
            message: `Uploading batch ${i + 1}/${batches.length}...`,
            progress: 20 + (i / batches.length) * 20
          }));

          const response = yield call(fetch, `${apiUrl}/sync/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ events: batch })
          });

          if (!response.ok) throw new Error(`Server Error: ${response.status}`);

          const result = yield call([response, 'json']);

          // Check for conflicts and handle according to strategy
          if (result.conflicts && result.conflicts.length > 0) {
            if (config.CONFLICT_STRATEGY === 'MANUAL') {
              // Queue conflicts for manual resolution
              yield put(syncActions.conflictsDetected(result.conflicts));
            } else {
              // Auto-resolve using Last-Write-Wins
              const resolvedEvents = result.conflicts.map((conflict: any) => {
                const localEvent = batch.find((e: SyncEvent) => e.id === conflict.localId);
                const serverEvent = conflict.serverEvent;
                return localEvent.timestamp > serverEvent.timestamp ? localEvent : serverEvent;
              });
              // Re-queue resolved events for next sync
              for (const event of resolvedEvents) {
                yield put(syncActions.queueEvent(event));
              }
            }
          }
        }

        // 4. Update Redux and Storage status for successfully synced events
        // Note: Conflicts are handled per batch above, so we'll mark all as synced for simplicity
        const syncedEventIds = pendingEvents.map((e: SyncEvent) => e.id);

        yield put(syncActions.eventsSynced(syncedEventIds));

        try {
          const { getSyncStorage } = yield import('./storage/instance');
          const storage = getSyncStorage();
          for (const eventId of syncedEventIds) {
            yield call([storage, 'markEventAsSynced'], eventId);
          }
        } catch (storageError) {
          console.error('Failed to update storage sync status:', storageError);
        }

        yield put(syncActions.syncProgress({ message: 'Event upload verified.', progress: 50 }));

      } catch (error: any) {
        yield put(syncActions.syncError({
          code: 'UPLOAD_FAILED',
          message: error.message || 'Failed to send events to server'
        }));
        return;
      }
    }

    // 5. Check for server-side updates (Pull mode)
    try {
      yield put(syncActions.syncProgress({ message: 'Fetching server updates...', progress: 70 }));

      const response = yield call(fetch, `${apiUrl}/sync/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const status = yield call([response, 'json']);
        yield put(syncActions.syncStatusUpdated(status));
      }
    } catch (pullError) {
      console.warn('Failed to pull server status:', pullError);
    }

    yield put(syncActions.syncProgress({ message: 'Sync cycle completed.', progress: 100 }));
    yield put(syncActions.syncCompleted());

  } catch (error: any) {
    yield put(syncActions.syncError({
      code: 'SYNC_GENERAL_ERROR',
      message: error.message || 'An unexpected error occurred during sync'
    }));
  }
}

/**
 * Retry logic with exponential backoff
 */
function* retryWithBackoff(fn: any, maxRetries: number, initialBackoff: number = 1000) {
  let attempt = 0;
  let backoff = initialBackoff;

  while (attempt < maxRetries) {
    try {
      return yield call(fn);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }

      yield put(syncActions.syncProgress({
        message: `Retrying sync (${attempt}/${maxRetries})...`,
        progress: Math.min(100, attempt * 20)
      }));

      yield delay(backoff);
      backoff = Math.min(backoff * 2, 30000); // Cap at 30 seconds
    }
  }
}

/**
 * Watcher for sync requests with timeout and debouncing
 */
function* watchSyncRequests() {
  yield takeLatest(syncActions.startSync.type, function* () {
    const config = loadSyncEnvironment();

    const { sync, timeout } = yield race({
      sync: call(retryWithBackoff, syncEvents, config.MAX_RETRIES),
      timeout: delay(config.TIMEOUT)
    });

    if (timeout) {
      yield put(syncActions.syncError({
        code: 'SYNC_TIMEOUT',
        message: `The sync operation timed out after ${config.TIMEOUT / 1000} seconds`
      }));
    }
  });
}

/**
 * Watcher for event queuing to trigger auto-sync
 */
function* watchEventQueue() {
  yield takeLatest(syncActions.queueEvent.type, function* (action: any) {
    const isOnline = yield select((state: any) => state.sync?.isOnline);
    const isSyncing = yield select((state: any) => state.sync?.isSyncing);

    // Persist to Storage Adapter immediately for durability
    try {
      const { getSyncStorage } = yield import('./storage/instance');
      const storage = getSyncStorage();
      yield call([storage, 'createEvent'], action.payload);
    } catch (storageError) {
      console.error('Persistence failure for event:', action.payload.id, storageError);
    }

    if (isOnline && !isSyncing) {
      yield delay(3000); // 3-second debounce to batch rapid events
      yield put(syncActions.startSync());
    }
  });
}

/**
 * Root Sync Saga
 */
export function* rootSyncSaga() {
  yield fork(watchNetworkConnectivity);
  yield fork(watchSyncRequests);
  yield fork(watchEventQueue);
}

// For backward compatibility if needed
export const syncSaga = rootSyncSaga;
