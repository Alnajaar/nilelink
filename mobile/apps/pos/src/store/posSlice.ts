import type { AnyAction } from 'redux';

export type PosState = {
  pendingSyncCount: number;
  lastSyncStatus: 'IDLE' | 'SYNCING' | 'SYNCED' | 'FAILED';
  restaurantId?: string;
};

const initialState: PosState = {
  pendingSyncCount: 0,
  lastSyncStatus: 'IDLE'
};

export const POS_SYNC_REQUESTED = 'pos/SYNC_REQUESTED';
export const POS_SYNC_STARTED = 'pos/SYNC_STARTED';
export const POS_SYNC_FINISHED = 'pos/SYNC_FINISHED';
export const POS_SYNC_FAILED = 'pos/SYNC_FAILED';
export const POS_PENDING_SYNC_UPDATED = 'pos/PENDING_SYNC_UPDATED';

export const posActions = {
  syncRequested: () => ({ type: POS_SYNC_REQUESTED } as const),
  syncStarted: () => ({ type: POS_SYNC_STARTED } as const),
  syncFinished: () => ({ type: POS_SYNC_FINISHED } as const),
  syncFailed: (error: string) => ({ type: POS_SYNC_FAILED, payload: { error } } as const),
  pendingSyncUpdated: (count: number) =>
    ({ type: POS_PENDING_SYNC_UPDATED, payload: { count } } as const)
};

export function posReducer(state: PosState = initialState, action: AnyAction): PosState {
  switch (action.type) {
    case POS_SYNC_STARTED:
      return { ...state, lastSyncStatus: 'SYNCING' };
    case POS_SYNC_FINISHED:
      return { ...state, lastSyncStatus: 'SYNCED', pendingSyncCount: 0 };
    case POS_SYNC_FAILED:
      return { ...state, lastSyncStatus: 'FAILED' };
    case POS_PENDING_SYNC_UPDATED:
      return { ...state, pendingSyncCount: action.payload.count };
    default:
      return state;
  }
}
