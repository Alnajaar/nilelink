import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { syncActions } from '../syncSaga';

export interface SyncStatusState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  errors: string[];
  lastSyncTime?: Date;
  queueItems: any[]; // From SQLite
}

export const useSyncStatus = (database?: any) => {
  const dispatch = useDispatch();
  const [syncStatus, setSyncStatus] = useState<SyncStatusState>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    errors: [],
    queueItems: []
  });

  // Update sync status from Redux state
  const reduxSyncState = useSelector((state: any) => state.sync);

  useEffect(() => {
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: state.isConnected || false
      }));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Load queue items from database periodically
    const loadQueueStatus = async () => {
      if (!database) return;

      try {
        // Check if database has sync methods
        if (database.getPendingEvents) {
          const pendingEvents = await database.getPendingEvents();
          setSyncStatus(prev => ({
            ...prev,
            pendingCount: pendingEvents.length,
            queueItems: pendingEvents.map((event: any) => ({
              id: event.eventId,
              type: event.type,
              entityType: event.streamId?.split('-')[0] || 'unknown',
              entityId: event.streamId?.split('-')[1] || 'unknown',
              timestamp: new Date(event.timestamp).getTime(),
              retryCount: 0, // TODO: Load from metadata
              status: 'pending' as const,
            }))
          }));
        } else {
          // For databases without sync events (like customer db), assume no pending items
          setSyncStatus(prev => ({
            ...prev,
            pendingCount: 0,
            queueItems: []
          }));
        }
      } catch (error) {
        console.error('Failed to load sync queue:', error);
        setSyncStatus(prev => ({
          ...prev,
          pendingCount: 0,
          queueItems: []
        }));
      }
    };

    loadQueueStatus();
    const interval = setInterval(loadQueueStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [database]);

  useEffect(() => {
    // Update from Redux state
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: reduxSyncState?.syncInProgress || false,
      errors: reduxSyncState?.syncErrors || [],
    }));
  }, [reduxSyncState]);

  const retrySync = () => {
    dispatch(syncActions.startSync());
  };

  const retryItem = (itemId: string) => {
    // TODO: Implement individual item retry
    console.log('Retry item:', itemId);
  };

  const removeItem = (itemId: string) => {
    // TODO: Implement item removal
    console.log('Remove item:', itemId);
  };

  const retryAll = () => {
    // Retry all failed items
    dispatch(syncActions.startSync());
  };

  const clearCompleted = () => {
    // TODO: Implement clearing completed items
    console.log('Clear completed items');
  };

  return {
    ...syncStatus,
    retrySync,
    retryItem,
    removeItem,
    retryAll,
    clearCompleted,
  };
};