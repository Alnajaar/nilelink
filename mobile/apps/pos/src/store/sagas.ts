
import { delay, put, takeLatest, call } from 'redux-saga/effects';
// import { createSyncSaga, type EventEnvelope, type VectorClock } from '@nilelink/mobile-sync-engine';
import { Database, type EventLog as DbEventLog } from '@nilelink/mobile-sqlite';
import { getDatabase } from '../services/database';
import { POS_SYNC_REQUESTED, posActions } from './posSlice';

// TODO: Sync functionality disabled due to missing @nilelink/mobile-sync-engine package
// Helper types and functions for sync are commented out

// function* createBoundSyncSaga() {
//   // Sync saga implementation commented out
// }

export function* rootSaga() {
  // TODO: Sync functionality disabled
  // yield takeLatest(POS_SYNC_REQUESTED, function* () {
  //   try {
  //     yield* createBoundSyncSaga();
  //   } catch (error) {
  //     console.error('Sync failed in rootSaga:', error);
  //     yield put(posActions.syncFailed(String(error)));
  //   }
  // });
}
