import { delay, put, takeLatest } from 'redux-saga/effects';
import { createSyncSaga } from '@nilelink/mobile-sync-engine';
import { POS_SYNC_REQUESTED, posActions } from './posSlice';

// Placeholder: wire to real SQLite-backed event store + network pull/push.
const noopStore = {
  async getAll() {
    return [];
  },
  async replace() {
    return;
  },
  async getPendingUploads() {
    return [];
  },
  async markUploaded() {
    return;
  },
  async getVectorClock() {
    return undefined;
  },
  async setVectorClock() {
    return;
  }
};

const noopPull = async () => [];
const noopPush = async () => undefined;

const syncSaga = createSyncSaga(
  { streamId: 'restaurant:demo', store: noopStore, pull: noopPull, push: noopPush },
  {
    started: () => posActions.syncStarted(),
    progressed: () => ({ type: 'pos/SYNC_PROGRESS' }),
    finished: () => posActions.syncFinished(),
    failed: (_streamId, error) => posActions.syncFailed(error)
  }
);

export function* rootSaga() {
  yield takeLatest(POS_SYNC_REQUESTED, function* () {
    yield put(posActions.syncStarted());
    yield delay(250);
    yield* syncSaga();
  });
}
