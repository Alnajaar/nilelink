import { call, put, takeEvery, takeLatest, fork, delay } from 'redux-saga/effects';
import NetInfo from '@react-native-community/netinfo';
import { CustomerDatabase, Order } from '../services/database';
import {
  CUSTOMER_LOGIN,
  CUSTOMER_LOGOUT,
  CUSTOMER_CART_ADD_ITEM,
  CUSTOMER_ORDER_CREATED,
  customerActions
} from './customerSlice';
import type { CustomerState, CartItem } from './customerSlice';

interface SagaContext {
  db: CustomerDatabase;
  maxSyncRetries: number;
  baseSyncDelay: number;
}

let context: SagaContext | null = null;

export function initializeSagaContext(db: CustomerDatabase) {
  context = { db, maxSyncRetries: 5, baseSyncDelay: 1000 };
}

function* watchNetworkStatus(): Generator<any, void, any> {
  const channel = NetInfo.addEventListener;
  
  while (true) {
    const netState = yield take(channel);
    yield put(customerActions.networkStatusChanged(netState.isConnected));
    
    if (netState.isConnected) {
      yield put(customerActions.syncStatusChanged('SYNCING'));
      // Trigger sync
      yield call(syncOfflineData);
      yield put(customerActions.syncStatusChanged('SYNCED'));
    }
  }
}

function* syncOfflineData(): Generator<any, void, any> {
  if (!context || !context.isConnected) return;

  try {
    // In real app, would sync with backend
    // For now, just clear pending sync
    yield put(customerActions.pendingSyncUpdated(0));
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

function* syncWithRetry(maxRetries = 5, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      yield call(syncOfflineData);
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      if (isLastAttempt) {
        yield put(customerActions.syncStatusChanged('FAILED'));
        return;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt);
      yield call(delay, delayMs);
    }
  }
}

function* handleLogin(action: any): Generator<any, void, any> {
  if (!context) return;
  
  try {
    // Save user to database
    const customer = yield call([context.db, 'getOrCreateCustomer'], action.payload.user.phone);
    
    // Fetch user's order history
    const orders = yield call([context.db, 'getCustomerOrders'], customer.id);
    yield put(customerActions.ordersFetched(orders));
    
  } catch (error) {
    console.error('Login failed:', error);
  }
}

function* handleLogout(): Generator<any, void, any> {
  // Clear any sensitive data
  console.log('User logged out');
}

function* handleCartAdd(action: any): Generator<any, void, any> {
  if (!context) return;
  
  try {
    // Queue cart update for sync if offline
    const isConnected = yield select((state: { customer: CustomerState }) => state.customer.isConnected);
    if (!isConnected) {
      // In real app, would add to sync queue
      console.log('Cart updated while offline - will sync when online');
    }
  } catch (error) {
    console.error('Cart update failed:', error);
  }
}

function* handleOrderCreate(action: any): Generator<any, void, any> {
  if (!context) return;
  
  try {
    const orderData = {
      ...action.payload.order,
      status: 'pending'
    };
    
    // Save order to local database
    const orderId = yield call([context.db, 'createOrder'], orderData);
    
    // Sync with backend if online
    const isConnected = yield select((state: { customer: CustomerState }) => state.customer.isConnected);
    
    if (isConnected) {
      // In real app, would submit to backend
      yield put(customerActions.orderUpdated(orderId, 'confirmed'));
    } else {
      // Queue for sync
      yield put(customerActions.pendingSyncUpdated(1));
    }
    
  } catch (error) {
    console.error('Order creation failed:', error);
  }
}

function* watchOrderUpdates(): Generator<any, void, any> {
  // In real app, would watch for order status updates from backend/push notifications
  yield takeEvery(CUSTOMER_ORDER_CREATED, handleOrderCreate);
}

export function* rootSaga() {
  yield fork(watchNetworkStatus);
  yield fork(watchOrderUpdates);
  
  yield takeLatest(CUSTOMER_LOGIN, handleLogin);
  yield takeLatest(CUSTOMER_LOGOUT, handleLogout);
  yield takeEvery(CUSTOMER_CART_ADD_ITEM, handleCartAdd);
}