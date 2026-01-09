import { call, put, takeEvery, takeLatest, fork, delay } from 'redux-saga/effects';
import NetInfo from '@react-native-community/netinfo';
import { CustomerDatabase, Order } from '../services/database';
import { rootSyncSaga } from '@nilelink/mobile-sync-engine';
import { customerActions } from './customerSlice';

interface SagaContext {
  db: CustomerDatabase;
  maxSyncRetries: number;
  baseSyncDelay: number;
  isConnected: boolean;
}

let context: SagaContext | null = null;

export function initializeSagaContext(db: CustomerDatabase) {
  context = { db, maxSyncRetries: 5, baseSyncDelay: 1000, isConnected: true };
}

// Simple network monitoring - just log status changes
function* watchNetworkStatus(): Generator<any, void, any> {
  try {
    const netState = yield call([NetInfo, 'fetch']);
    console.log('Network status:', netState.isConnected ? 'Online' : 'Offline');
    context!.isConnected = netState.isConnected;
  } catch (error) {
    console.error('Network status check failed:', error);
  }
}

function* syncOfflineData(): Generator<any, void, any> {
  if (!context || !context.isConnected) return;

  try {
    console.log('Syncing offline data with NileLink Sync Engine...');
    // The sync engine will handle the actual syncing via rootSyncSaga
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Watch for cart changes and potentially queue for sync
function* handleCartAdd(): Generator<any, void, any> {
  if (!context || !context.isConnected) {
    // Queue cart changes for later sync
    console.log('Cart updated while offline - will sync when online');
  }
}

// Watch for order creation
function* handleOrderCreate(action: any): Generator<any, void, any> {
  if (!context) return;

  try {
    const orderData = action.payload;

    // Save order to local database
    const orderId = yield call([context.db, 'createOrder'], orderData);

    if (context.isConnected) {
      // In real app, would submit to backend via sync engine
      yield put(customerActions.updateOrderStatus({ orderId, status: 'confirmed' }));
    } else {
      // Queue for sync when back online
      console.log('Order created offline - will sync when online');
    }

  } catch (error) {
    console.error('Order creation failed:', error);
  }
}

export function* rootSaga() {
  // Initialize network monitoring
  yield fork(watchNetworkStatus);

  // Fork the NileLink Sync Engine
  yield fork(rootSyncSaga);

  // Watch for app-specific actions
  yield takeEvery(customerActions.addToCart.type, handleCartAdd);
  yield takeEvery(customerActions.createOrder.type, handleOrderCreate);
}