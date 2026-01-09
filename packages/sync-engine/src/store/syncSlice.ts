import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SyncState, SyncEvent, SyncError, SyncConflict } from '../types/sync.types';

const initialState: SyncState = {
  isOnline: true,
  isSyncing: false,
  lastSyncTime: undefined,
  pendingEvents: [],
  errors: [],
  serverEvents: [],
  conflicts: [],
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    // Network state
    networkOnline: (state) => {
      state.isOnline = true;
    },
    networkOffline: (state) => {
      state.isOnline = false;
    },

    // Sync operations
    startSync: (state) => {
      state.isSyncing = true;
      state.errors = []; // Clear previous errors
    },
    syncStarted: (state) => {
      state.isSyncing = true;
      state.errors = [];
    },
    syncCompleted: (state) => {
      state.isSyncing = false;
      state.lastSyncTime = new Date();
      state.progress = undefined;
    },
    syncCancelled: (state) => {
      state.isSyncing = false;
      state.progress = undefined;
    },

    // Event queue management
    queueEvent: (state, action: PayloadAction<SyncEvent>) => {
      state.pendingEvents.push(action.payload);
    },
    eventsSynced: (state, action: PayloadAction<string[]>) => {
      state.pendingEvents = state.pendingEvents.filter(
        event => !action.payload.includes(event.id)
      );
    },
    clearPendingEvents: (state) => {
      state.pendingEvents = [];
    },

    // Server events
    serverEventsReceived: (state, action: PayloadAction<SyncEvent[]>) => {
      state.serverEvents = action.payload;
    },
    clearServerEvents: (state) => {
      state.serverEvents = [];
    },

    // Sync status
    syncStatusUpdated: (state, action: PayloadAction<any>) => {
      // Update sync status from server
      state.lastSyncTime = action.payload.lastSync || state.lastSyncTime;
    },

    // Progress tracking
    syncProgress: (state, action: PayloadAction<{ message: string; progress: number }>) => {
      state.progress = action.payload;
    },

    // Error handling
    syncError: (state, action: PayloadAction<SyncError>) => {
      state.isSyncing = false;
      state.errors.push({
        ...action.payload,
        timestamp: new Date(),
      });
      state.progress = undefined;
    },
    clearErrors: (state) => {
      state.errors = [];
    },
    dismissError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(error => error.code !== action.payload);
    },

    // Conflict resolution
    conflictsDetected: (state, action: PayloadAction<SyncConflict[]>) => {
      state.conflicts = action.payload;
    },
    resolveConflict: (state, action: PayloadAction<{ conflictId: string; resolution: SyncEvent }>) => {
      state.conflicts = state.conflicts.filter(conflict => conflict.localId !== action.payload.conflictId);
      state.pendingEvents.push(action.payload.resolution);
    },
    clearConflicts: (state) => {
      state.conflicts = [];
    },

    // Retry operations
    retrySync: (state) => {
      // Reset sync state for retry
      state.isSyncing = false;
      state.errors = [];
      state.progress = undefined;
    },
  },
});

export const syncActions = syncSlice.actions;
export const syncReducer = syncSlice.reducer;
export default syncSlice.reducer;