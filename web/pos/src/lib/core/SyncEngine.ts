// Offline-First Sync & Reconciliation Engine
// Handles data synchronization, conflict resolution, and offline operation

import { eventBus, createEvent } from './EventBus';

export enum SyncStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  SYNCING = 'syncing',
  CONFLICT = 'conflict',
  ERROR = 'error'
}

export enum SyncPriority {
  CRITICAL = 'critical',    // Must sync immediately
  HIGH = 'high',           // Sync as soon as possible
  NORMAL = 'normal',       // Standard sync priority
  LOW = 'low',            // Can wait for optimal conditions
  BACKGROUND = 'background' // Only sync when idle
}

export enum ConflictResolutionStrategy {
  CLIENT_WINS = 'client_wins',       // Local changes override server
  SERVER_WINS = 'server_wins',       // Server changes override local
  MERGE = 'merge',                   // Attempt to merge changes
  MANUAL = 'manual',                 // Require manual resolution
  LATEST_WINS = 'latest_wins'        // Most recent change wins
}

export interface SyncItem {
  id: string;
  type: string;                      // 'product', 'transaction', 'inventory', etc.
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  version: number;
  deviceId: string;
  userId: string;
  priority: SyncPriority;
  retryCount: number;
  maxRetries: number;
  lastAttempt?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SyncBatch {
  id: string;
  items: SyncItem[];
  createdAt: number;
  priority: SyncPriority;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  metadata?: Record<string, any>;
}

export interface SyncConflict {
  id: string;
  itemId: string;
  localVersion: SyncItem;
  serverVersion: any;
  conflictType: 'version' | 'deletion' | 'structure';
  detectedAt: number;
  resolution?: ConflictResolutionStrategy;
  resolvedAt?: number;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

export interface SyncConfiguration {
  batchSize: number;
  retryAttempts: number;
  retryDelay: number;
  conflictStrategy: ConflictResolutionStrategy;
  syncInterval: number;              // How often to check for sync (in ms)
  bandwidthLimit: number;            // Max bandwidth usage (bytes/sec)
  storageLimit: number;              // Max offline storage (MB)
  enableCompression: boolean;
  enableEncryption: boolean;
}

export interface SyncStatistics {
  totalSynced: number;
  totalFailed: number;
  totalConflicts: number;
  averageSyncTime: number;
  bandwidthUsed: number;
  storageUsed: number;
  lastSyncTime?: number;
  nextSyncTime?: number;
}

class SyncEngine {
  private syncQueue: SyncItem[] = [];
  private activeBatches: Map<string, SyncBatch> = new Map();
  private conflicts: Map<string, SyncConflict> = new Map();
  private syncStats: SyncStatistics = {
    totalSynced: 0,
    totalFailed: 0,
    totalConflicts: 0,
    averageSyncTime: 0,
    bandwidthUsed: 0,
    storageUsed: 0
  };
  private config: SyncConfiguration;
  private status: SyncStatus = SyncStatus.OFFLINE;
  private syncInterval?: NodeJS.Timeout;
  private isInitialized = false;

  constructor() {
    this.config = this.getDefaultConfig();
    if (typeof window !== 'undefined') {
      this.initializeEventListeners();
    }
  }

  /**
   * Get default sync configuration
   */
  private getDefaultConfig(): SyncConfiguration {
    return {
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000,        // 5 seconds
      conflictStrategy: ConflictResolutionStrategy.LATEST_WINS,
      syncInterval: 30000,     // 30 seconds
      bandwidthLimit: 100000,  // 100KB/s
      storageLimit: 100,       // 100MB
      enableCompression: true,
      enableEncryption: true
    };
  }

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Listen for data changes that need syncing
    eventBus.subscribe('PRODUCT_CREATED', (event) => {
      this.queueSyncItem({
        id: event.payload.product.id,
        type: 'product',
        operation: 'create',
        data: event.payload.product,
        timestamp: Date.now(),
        version: 1,
        deviceId: 'current_device',
        userId: 'current_user',
        priority: SyncPriority.NORMAL,
        retryCount: 0,
        maxRetries: this.config.retryAttempts
      });
    });

    eventBus.subscribe('TRANSACTION_COMPLETED', (event) => {
      this.queueSyncItem({
        id: event.payload.transaction.id,
        type: 'transaction',
        operation: 'create',
        data: event.payload.transaction,
        timestamp: Date.now(),
        version: 1,
        deviceId: 'current_device',
        userId: 'current_user',
        priority: SyncPriority.HIGH,
        retryCount: 0,
        maxRetries: this.config.retryAttempts
      });
    });

    eventBus.subscribe('INVENTORY_UPDATED', (event) => {
      this.queueSyncItem({
        id: `inv_${Date.now()}`,
        type: 'inventory',
        operation: 'update',
        data: event.payload,
        timestamp: Date.now(),
        version: 1,
        deviceId: 'current_device',
        userId: 'current_user',
        priority: SyncPriority.NORMAL,
        retryCount: 0,
        maxRetries: this.config.retryAttempts
      });
    });

    // Listen for network status changes
    window.addEventListener('online', () => {
      this.setOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.setOfflineStatus();
    });
  }

  /**
   * Queue an item for synchronization
   */
  async queueSyncItem(item: SyncItem): Promise<void> {
    // Check if item already exists in queue
    const existingIndex = this.syncQueue.findIndex(
      queued => queued.id === item.id && queued.type === item.type
    );

    if (existingIndex !== -1) {
      // Update existing item
      this.syncQueue[existingIndex] = item;
    } else {
      // Add new item
      this.syncQueue.push(item);
    }

    // Sort by priority
    this.syncQueue.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    // Persist to local storage
    await this.persistSyncQueue();

    // Publish event
    await eventBus.publish(createEvent('SYNC_ITEM_QUEUED', {
      item
    }, {
      source: 'SyncEngine'
    }));

    // Trigger sync if online
    if (this.status === SyncStatus.ONLINE) {
      this.triggerSync();
    }
  }

  /**
   * Trigger synchronization
   */
  async triggerSync(): Promise<void> {
    if (this.status !== SyncStatus.ONLINE || this.syncQueue.length === 0) {
      return;
    }

    this.status = SyncStatus.SYNCING;

    try {
      // Create sync batch
      const batch = await this.createSyncBatch();
      this.activeBatches.set(batch.id, batch);

      // Process batch
      await this.processSyncBatch(batch);

      // Update statistics
      this.updateSyncStatistics(batch);

      this.status = SyncStatus.ONLINE;

    } catch (error: any) {
      this.status = SyncStatus.ERROR;
      console.error('SyncEngine: Sync failed:', error);

      await eventBus.publish(createEvent('SYNC_ERROR', {
        error: error.message,
        batchId: 'current'
      }, {
        source: 'SyncEngine',
        priority: 'high'
      }));

      // Retry logic would go here
      setTimeout(() => {
        this.status = SyncStatus.ONLINE;
      }, this.config.retryDelay);
    }
  }

  /**
   * Create a sync batch from queued items
   */
  private async createSyncBatch(): Promise<SyncBatch> {
    const batchItems = this.syncQueue.splice(0, this.config.batchSize);

    const batch: SyncBatch = {
      id: `batch_${Date.now()}_${Math.random()}`,
      items: batchItems,
      createdAt: Date.now(),
      priority: this.getBatchPriority(batchItems),
      status: 'pending',
      progress: {
        total: batchItems.length,
        completed: 0,
        failed: 0
      }
    };

    return batch;
  }

  /**
   * Process a sync batch
   */
  private async processSyncBatch(batch: SyncBatch): Promise<void> {
    batch.status = 'syncing';

    for (const item of batch.items) {
      try {
        await this.syncItem(item);
        batch.progress.completed++;
      } catch (error: any) {
        console.error(`SyncEngine: Failed to sync item ${item.id}:`, error);
        item.error = error.message;
        item.retryCount++;

        if (item.retryCount < item.maxRetries) {
          // Re-queue for retry
          this.syncQueue.push(item);
        } else {
          batch.progress.failed++;
        }
      }
    }

    batch.status = batch.progress.failed === 0 ? 'completed' : 'failed';
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncItem): Promise<void> {
    // This would make actual API calls to sync data
    // For now, simulate sync with delay

    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate occasional conflicts
    if (Math.random() < 0.05) { // 5% chance of conflict
      throw new Error('Version conflict detected');
    }

    // Remove from queue after successful sync
    const index = this.syncQueue.findIndex(queued => queued.id === item.id);
    if (index !== -1) {
      this.syncQueue.splice(index, 1);
    }

    this.syncStats.totalSynced++;
    item.lastAttempt = Date.now();
  }

  /**
   * Handle sync conflicts
   */
  private async handleSyncConflict(item: SyncItem, serverData: any): Promise<void> {
    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}_${Math.random()}`,
      itemId: item.id,
      localVersion: item,
      serverVersion: serverData,
      conflictType: 'version',
      detectedAt: Date.now()
    };

    this.conflicts.set(conflict.id, conflict);
    this.syncStats.totalConflicts++;

    // Apply conflict resolution strategy
    await this.resolveConflict(conflict);

    await eventBus.publish(createEvent('SYNC_CONFLICT', {
      conflict
    }, {
      source: 'SyncEngine',
      priority: 'high'
    }));
  }

  /**
   * Resolve sync conflict
   */
  private async resolveConflict(conflict: SyncConflict): Promise<void> {
    const strategy = this.config.conflictStrategy;

    switch (strategy) {
      case ConflictResolutionStrategy.CLIENT_WINS:
        // Keep local version, re-sync
        await this.queueSyncItem(conflict.localVersion);
        break;

      case ConflictResolutionStrategy.SERVER_WINS:
        // Accept server version, update local
        await this.applyServerVersion(conflict);
        break;

      case ConflictResolutionStrategy.LATEST_WINS:
        const localTime = conflict.localVersion.timestamp;
        const serverTime = conflict.serverVersion.timestamp || 0;

        if (localTime > serverTime) {
          await this.queueSyncItem(conflict.localVersion);
        } else {
          await this.applyServerVersion(conflict);
        }
        break;

      case ConflictResolutionStrategy.MERGE:
        // Attempt to merge changes
        await this.mergeVersions(conflict);
        break;

      case ConflictResolutionStrategy.MANUAL:
        // Mark for manual resolution
        conflict.resolution = strategy;
        await eventBus.publish(createEvent('SYNC_MANUAL_RESOLUTION_NEEDED', {
          conflict
        }, {
          source: 'SyncEngine',
          priority: 'critical'
        }));
        break;
    }

    conflict.resolvedAt = Date.now();
    conflict.resolution = strategy;
  }

  /**
   * Apply server version to local data
   */
  private async applyServerVersion(conflict: SyncConflict): Promise<void> {
    // Update local data with server version
    // This would update the appropriate engine (product, inventory, etc.)
    console.log('SyncEngine: Applying server version for', conflict.itemId);
  }

  /**
   * Merge conflicting versions
   */
  private async mergeVersions(conflict: SyncConflict): Promise<void> {
    // Attempt intelligent merge
    // For simple cases, this might work
    try {
      const merged = { ...conflict.serverVersion, ...conflict.localVersion.data };
      await this.queueSyncItem({
        ...conflict.localVersion,
        data: merged,
        operation: 'update'
      });
    } catch (error) {
      // Fall back to manual resolution
      conflict.resolution = ConflictResolutionStrategy.MANUAL;
    }
  }

  /**
   * Get priority weight for sorting
   */
  private getPriorityWeight(priority: SyncPriority): number {
    const weights = {
      [SyncPriority.CRITICAL]: 100,
      [SyncPriority.HIGH]: 75,
      [SyncPriority.NORMAL]: 50,
      [SyncPriority.LOW]: 25,
      [SyncPriority.BACKGROUND]: 10
    };

    return weights[priority] || 50;
  }

  /**
   * Get batch priority based on highest priority item
   */
  private getBatchPriority(items: SyncItem[]): SyncPriority {
    const priorities = items.map(item => item.priority);
    const priorityOrder = [SyncPriority.CRITICAL, SyncPriority.HIGH, SyncPriority.NORMAL, SyncPriority.LOW, SyncPriority.BACKGROUND];

    for (const priority of priorityOrder) {
      if (priorities.includes(priority)) {
        return priority;
      }
    }

    return SyncPriority.NORMAL;
  }

  /**
   * Set online status
   */
  private async setOnlineStatus(): Promise<void> {
    this.status = SyncStatus.ONLINE;
    await eventBus.publish(createEvent('SYNC_STATUS_CHANGED', {
      status: this.status
    }, {
      source: 'SyncEngine'
    }));

    // Start sync interval
    this.startSyncInterval();

    // Trigger immediate sync
    this.triggerSync();
  }

  /**
   * Set offline status
   */
  private async setOfflineStatus(): Promise<void> {
    this.status = SyncStatus.OFFLINE;
    this.stopSyncInterval();

    await eventBus.publish(createEvent('SYNC_STATUS_CHANGED', {
      status: this.status
    }, {
      source: 'SyncEngine'
    }));
  }

  /**
   * Start periodic sync
   */
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.triggerSync();
    }, this.config.syncInterval);
  }

  /**
   * Stop periodic sync
   */
  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Persist sync queue to local storage
   */
  private async persistSyncQueue(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const queueData = this.syncQueue.map(item => ({
        ...item,
        data: JSON.stringify(item.data) // Serialize complex objects
      }));

      localStorage.setItem('pos_sync_queue', JSON.stringify(queueData));
    } catch (error) {
      console.warn('SyncEngine: Failed to persist sync queue:', error);
    }
  }

  /**
   * Load sync queue from local storage
   */
  private async loadSyncQueue(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('pos_sync_queue');
      if (stored) {
        const queueData = JSON.parse(stored);
        this.syncQueue = queueData.map((item: any) => ({
          ...item,
          data: JSON.parse(item.data)
        }));
      }
    } catch (error) {
      console.warn('SyncEngine: Failed to load sync queue:', error);
    }
  }

  /**
   * Update sync statistics
   */
  private updateSyncStatistics(batch: SyncBatch): void {
    this.syncStats.lastSyncTime = Date.now();
    this.syncStats.nextSyncTime = Date.now() + this.config.syncInterval;

    // Calculate average sync time (simplified)
    const syncTime = Date.now() - batch.createdAt;
    this.syncStats.averageSyncTime =
      (this.syncStats.averageSyncTime + syncTime) / 2;
  }

  /**
   * Get sync statistics
   */
  getStatistics(): SyncStatistics {
    return { ...this.syncStats };
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Get pending sync items count
   */
  getPendingCount(): number {
    return this.syncQueue.length;
  }

  /**
   * Get unresolved conflicts
   */
  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).filter(
      conflict => !conflict.resolvedAt
    );
  }

  /**
   * Manually resolve conflict
   */
  async resolveConflictManually(conflictId: string, resolution: ConflictResolutionStrategy): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    conflict.resolution = resolution;
    await this.resolveConflict(conflict);
  }

  /**
   * Force sync now
   */
  async forceSync(): Promise<void> {
    await this.triggerSync();
  }

  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<SyncConfiguration>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.status === SyncStatus.ONLINE) {
      this.startSyncInterval(); // Restart with new interval
    }
  }

  /**
   * Initialize the engine
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;
    await this.loadSyncQueue();

    // Check initial network status
    if (navigator.onLine) {
      await this.setOnlineStatus();
    } else {
      await this.setOfflineStatus();
    }

    this.isInitialized = true;
    console.log('SyncEngine: Initialized');
  }

  /**
   * Shutdown the engine
   */
  shutdown(): void {
    this.stopSyncInterval();
    this.isInitialized = false;
    console.log('SyncEngine: Shutdown');
  }
}

// Global sync engine instance
export const syncEngine = new SyncEngine();