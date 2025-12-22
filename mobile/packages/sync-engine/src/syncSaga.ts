import { call, put } from 'redux-saga/effects';
import type { EventEnvelope, VectorClock } from './types';
import { mergeEventSets } from './merge';
import { validateEvents } from './validation';

export type SyncPull = (args: { streamId: string; known: VectorClock }) => Promise<EventEnvelope[]>;
export type SyncPush = (args: { streamId: string; events: EventEnvelope[] }) => Promise<void>;

export type LocalEventStore = {
  getAll(streamId: string): Promise<EventEnvelope[]>;
  replace(streamId: string, events: EventEnvelope[]): Promise<void>;
  getPendingUploads(streamId: string): Promise<EventEnvelope[]>;
  markUploaded(eventIds: string[]): Promise<void>;
  getVectorClock(streamId: string): Promise<VectorClock | undefined>;
  setVectorClock(streamId: string, vc: VectorClock): Promise<void>;
};

export type SyncDeps = {
  streamId: string;
  store: LocalEventStore;
  pull: SyncPull;
  push: SyncPush;
};

export type SyncActions = {
  started: (streamId: string) => { type: string; payload: { streamId: string } };
  progressed: (streamId: string, stage: string) => { type: string; payload: { streamId: string; stage: string } };
  finished: (streamId: string) => { type: string; payload: { streamId: string } };
  failed: (streamId: string, error: string) => { type: string; payload: { streamId: string; error: string } };
};

export function createSyncSaga(deps: SyncDeps, actions: SyncActions) {
  return function* syncSaga() {
    try {
      yield put(actions.started(deps.streamId));

      yield put(actions.progressed(deps.streamId, 'load-local'));
      const local: EventEnvelope[] = yield call([deps.store, deps.store.getAll], deps.streamId);
      const known: VectorClock | undefined = yield call([deps.store, deps.store.getVectorClock], deps.streamId);

      yield put(actions.progressed(deps.streamId, 'pull'));
      const remote: EventEnvelope[] = yield call(deps.pull, { streamId: deps.streamId, known: known ?? {} });

      yield put(actions.progressed(deps.streamId, 'merge-validate'));
      const { mergedEvents, vectorClock } = mergeEventSets(local, remote);

      const validation = yield call(validateEvents, mergedEvents, { expectedStreamId: deps.streamId });
      if (validation.ok === false) {
        throw new Error(`Event validation failed: ${validation.issues[0]?.message ?? 'unknown'}`);
      }

      yield put(actions.progressed(deps.streamId, 'persist'));
      yield call([deps.store, deps.store.replace], deps.streamId, mergedEvents);
      yield call([deps.store, deps.store.setVectorClock], deps.streamId, vectorClock);

      yield put(actions.progressed(deps.streamId, 'push'));
      const pending: EventEnvelope[] = yield call([deps.store, deps.store.getPendingUploads], deps.streamId);
      if (pending.length) {
        yield call(deps.push, { streamId: deps.streamId, events: pending });
        yield call([deps.store, deps.store.markUploaded], pending.map((e) => e.eventId));
      }

      yield put(actions.finished(deps.streamId));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      yield put(actions.failed(deps.streamId, message));
    }
  };
}
