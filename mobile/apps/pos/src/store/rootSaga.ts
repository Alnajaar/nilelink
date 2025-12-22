import { call, put, select, take, takeEvery, takeLatest, fork, race, cancelled, delay } from 'redux-saga/effects';
import NetInfo from '@react-native-community/netinfo';
import { Database, type EventLog, type Order, type PaymentQueueItem } from '@nilelink/mobile-sqlite';
import { createSyncSaga, type SyncPull, type SyncPush, type VectorClock } from '@nilelink/mobile-sync-engine';
import { 
  POS_SYNC_REQUESTED, posActions, 
  POS_ORDER_CREATED, POS_PAYMENT_PROCESSED, 
  POS_INVENTORY_UPDATED, POS_NETWORK_STATUS_CHANGED
} from './posSlice';
import { type PosState } from './posSlice';

interface SagaContext {
  db: Database;
  maxSyncRetries: number;
  baseSyncDelay: number;
}

let context: SagaContext | null = null;

export function initializeSagaContext(db: Database) {
  context = { db, maxSyncRetries: 5, baseSyncDelay: 1000 };
}

function* watchNetworkStatus(): Generator<any, void, any> {
  const channel = NetInfo.addEventListener;
  
  while (true) {
    const netState = yield take(channel);
    yield put({
      type: POS_NETWORK_STATUS_CHANGED,
      payload: { isConnected: netState.isConnected }
    });
    
    if (netState.isConnected) {
      yield put(posActions.syncRequested());
    }
  }
}

function* syncWithRetry(maxRetries = 5, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      yield call(performSync);
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      if (isLastAttempt) {
        const message = error instanceof Error ? error.message : String(error);
        yield put(posActions.syncFailed(message));
        return;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt);
      yield call(delay, delayMs);
    }
  }
}

function* performSync(): Generator<any, void, any> {
  if (!context) throw new Error('Saga context not initialized');
  
  const pull: SyncPull = function* ({ streamId, known }) {
    try {
      const remoteEvents = yield call(fetchRemoteEvents, streamId, known);
      return remoteEvents;
    } catch (error) {
      throw new Error(`Failed to pull events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const push: SyncPush = function* ({ streamId, events }) {
    try {
      yield call(uploadEvents, streamId, events);
    } catch (error) {
      throw new Error(`Failed to push events: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const syncSaga = createSyncSaga(
    {
      streamId: 'restaurant-pos-sync',
      store: {
        getAll: (streamId: string) => context!.db.getAllEvents(streamId),
        replace: (streamId: string, events: any[]) => context!.db.replaceEvents(streamId, events),
        getPendingUploads: (streamId: string) => context!.db.getPendingEvents(streamId),
        markUploaded: (eventIds: string[]) => context!.db.markEventsAsUploaded(eventIds),
        getVectorClock: (streamId: string) => context!.db.getVectorClock(streamId),
        setVectorClock: (streamId: string, vc: VectorClock) => context!.db.setVectorClock(streamId, vc)
      },
      pull,
      push
    },
    {
      started: (streamId: string) => posActions.syncStarted(),
      progressed: (streamId: string, stage: string) => ({ type: 'pos/SYNC_PROGRESS', payload: { streamId, stage } }),
      finished: (streamId: string) => posActions.syncFinished(),
      failed: (streamId: string, error: string) => posActions.syncFailed(error)
    }
  );

  yield* syncSaga();
}

function* watchOrderCreation() {
  yield takeEvery(POS_ORDER_CREATED, function* (action: any) {
    if (!context) return;
    
    try {
      const event: EventLog = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'OrderCreated',
        data: action.payload.order,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      yield call([context.db, 'createEvent'], event);
      
      // Update pending sync count
      const pendingCount = yield call([context.db, 'getPendingEventsCount']);
      yield put(posActions.pendingSyncUpdated(pendingCount));
    } catch (error) {
      console.error('Failed to log order creation event:', error);
    }
  });
}

function* watchPaymentProcessing() {
  yield takeEvery(POS_PAYMENT_PROCESSED, function* (action: any) {
    if (!context) return;
    
    try {
      const { orderId, amount_usd } = action.payload;
      
      // Add payment to queue
      yield call([context.db, 'addToPaymentQueue'], orderId, amount_usd);
      
      // Create event log
      const event: EventLog = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'PaymentProcessed',
        data: action.payload,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      yield call([context.db, 'createEvent'], event);
      
      // Update pending sync count
      const pendingCount = yield call([context.db, 'getPendingEventsCount']);
      yield put(posActions.pendingSyncUpdated(pendingCount));
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  });
}

function* watchInventoryUpdates() {
  yield takeEvery(POS_INVENTORY_UPDATED, function* (action: any) {
    if (!context) return;
    
    try {
      const event: EventLog = {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'InventoryUpdated',
        data: action.payload,
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      yield call([context.db, 'createEvent'], event);
      
      // Update pending sync count
      const pendingCount = yield call([context.db, 'getPendingEventsCount']);
      yield put(posActions.pendingSyncUpdated(pendingCount));
    } catch (error) {
      console.error('Failed to log inventory update:', error);
    }
  });
}

function* processPaymentQueue() {
  if (!context) return;
  
  const pendingPayments: PaymentQueueItem[] = yield call([context.db, 'getPaymentQueueItems'], 'PENDING');
  
  for (const payment of pendingPayments) {
    try {
      yield call([context.db, 'updatePaymentStatus'], payment.paymentId, 'SUBMITTED');
      
      // Submit to blockchain
      const txHash = yield call(submitPaymentToBlockchain, payment);
      
      yield call([context.db, 'updatePaymentStatus'], payment.paymentId, 'CONFIRMED', txHash);
      
      // Update order status
      yield call([context.db, 'updateOrderStatus'], payment.orderId, 'PAID');
    } catch (error) {
      console.error(`Payment ${payment.paymentId} failed:`, error);
      yield call([context.db, 'updatePaymentStatus'], payment.paymentId, 'FAILED');
    }
  }
}

async function fetchRemoteEvents(streamId: string, known: VectorClock): Promise<any[]> {
  // Placeholder - will integrate with blockchain/smart contract
  return [];
}

async function uploadEvents(streamId: string, events: any[]): Promise<void> {
  // Placeholder - will integrate with blockchain/smart contract
}

async function submitPaymentToBlockchain(payment: PaymentQueueItem): Promise<string> {
  // Placeholder - will integrate with Magic wallet and blockchain
  return `0x${'0'.repeat(64)}`;
}

export function* rootSaga() {
  yield fork(watchNetworkStatus);
  yield fork(watchOrderCreation);
  yield fork(watchPaymentProcessing);
  yield fork(watchInventoryUpdates);
  
  yield takeLatest(POS_SYNC_REQUESTED, function* () {
    yield call(syncWithRetry);
  });
}