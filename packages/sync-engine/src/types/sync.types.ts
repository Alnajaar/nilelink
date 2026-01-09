export interface SyncEvent {
  id: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: Date;
  version: number;
  correlationId?: string;
  causationId?: string;
}

export interface SyncError {
  code: string;
  message: string;
  details?: any;
  timestamp?: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: Date;
  pendingCount: number;
  errors: SyncError[];
  progress?: {
    message: string;
    progress: number;
  };
}

export interface SyncConflict {
  localId: string;
  serverEvent: SyncEvent;
  localEvent: SyncEvent;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: Date;
  pendingEvents: SyncEvent[];
  errors: SyncError[];
  progress?: {
    message: string;
    progress: number;
  };
  serverEvents: SyncEvent[];
  conflicts: SyncConflict[];
}

export interface NetworkState {
  isConnected: boolean;
  type: string;
  timestamp: Date;
}

export interface SyncConfig {
  maxRetries: number;
  initialBackoff: number;
  maxBackoff: number;
  batchSize: number;
  syncInterval: number;
  conflictStrategy: 'LWW' | 'MANUAL';
}