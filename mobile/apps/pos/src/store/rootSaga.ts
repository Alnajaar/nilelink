import { fork, all } from 'redux-saga/effects';
// import { rootSyncSaga } from '@nilelink/sync-engine';
import { Database } from '@nilelink/mobile-sqlite';

// ... import other feature sagas

export function initializeSagaContext(db: Database) {
  // Can be used for other feature sagas
}

export function* rootSaga() {
  yield all([
    // fork(rootSyncSaga), // TODO: Disabled due to missing sync-engine
    // fork(watchOrderCreation),
    // fork(watchPaymentProcessing),
    // ... add other watchers back as needed, but ensuring they don't conflict
  ]);
}
