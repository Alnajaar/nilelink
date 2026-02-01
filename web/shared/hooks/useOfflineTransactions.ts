import { useState, useEffect, useCallback } from 'react';

// Transaction types for offline queue
export interface OfflineTransaction {
  id: string;
  type: 'payment' | 'order' | 'supplier_onboarding' | 'inventory_update';
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Offline status types
export interface OfflineStatus {
  isOnline: boolean;
  connectionQuality: 'offline' | 'poor' | 'fair' | 'good' | 'excellent';
  lastOnline: number;
  queuedTransactions: number;
  isSyncing: boolean;
}

export const useOfflineTransactions = () => {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    connectionQuality: 'good',
    lastOnline: Date.now(),
    queuedTransactions: 0,
    isSyncing: false
  });

  const [queuedTransactions, setQueuedTransactions] = useState<OfflineTransaction[]>([]);

  // Initialize IndexedDB for offline storage
  const initDB = useCallback(async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NileLinkOfflineDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('status', 'status', { unique: false });
          transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          transactionStore.createIndex('priority', 'priority', { unique: false });
        }

        // Create sync metadata store
        if (!db.objectStoreNames.contains('syncMetadata')) {
          db.createObjectStore('syncMetadata', { keyPath: 'key' });
        }
      };
    });
  }, []);

  // Queue a transaction for offline processing
  const queueTransaction = useCallback(async (
    transaction: Omit<OfflineTransaction, 'id' | 'timestamp' | 'retryCount' | 'status'>
  ): Promise<string> => {
    const db = await initDB();
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const offlineTx: OfflineTransaction = {
      ...transaction,
      id: transactionId,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.add(offlineTx);

      request.onsuccess = () => {
        setQueuedTransactions(prev => [...prev, offlineTx]);
        setOfflineStatus(prev => ({
          ...prev,
          queuedTransactions: prev.queuedTransactions + 1
        }));
        resolve(transactionId);
      };

      request.onerror = () => reject(request.error);
    });
  }, [initDB]);

  // Get all queued transactions
  const getQueuedTransactions = useCallback(async (): Promise<OfflineTransaction[]> => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();

      request.onsuccess = () => {
        const transactions = request.result as OfflineTransaction[];
        setQueuedTransactions(transactions);
        resolve(transactions);
      };

      request.onerror = () => reject(request.error);
    });
  }, [initDB]);

  // Update transaction status
  const updateTransactionStatus = useCallback(async (
    transactionId: string,
    status: OfflineTransaction['status'],
    error?: string
  ): Promise<void> => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const getRequest = store.get(transactionId);

      getRequest.onsuccess = () => {
        const tx = getRequest.result as OfflineTransaction;
        if (tx) {
          tx.status = status;
          if (error) tx.error = error;

          const updateRequest = store.put(tx);
          updateRequest.onsuccess = () => {
            setQueuedTransactions(prev =>
              prev.map(t => t.id === transactionId ? { ...t, status, error } : t)
            );
            resolve();
          };
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve(); // Transaction not found, might have been processed
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }, [initDB]);

  // Remove completed transaction from queue
  const removeTransaction = useCallback(async (transactionId: string): Promise<void> => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.delete(transactionId);

      request.onsuccess = () => {
        setQueuedTransactions(prev => prev.filter(t => t.id !== transactionId));
        setOfflineStatus(prev => ({
          ...prev,
          queuedTransactions: Math.max(0, prev.queuedTransactions - 1)
        }));
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }, [initDB]);

  // Sync pending transactions when online
  const syncTransactions = useCallback(async (): Promise<void> => {
    if (!offlineStatus.isOnline || offlineStatus.isSyncing) return;

    setOfflineStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const pendingTxs = queuedTransactions.filter(tx => tx.status === 'pending');

      for (const tx of pendingTxs) {
        try {
          const success = await processTransaction(tx);

          if (success) {
            await updateTransactionStatus(tx.id, 'completed');
            await removeTransaction(tx.id);
          } else {
            await updateTransactionStatus(tx.id, 'failed', 'Transaction processing failed');
          }
        } catch (error) {
          console.error(`Failed to sync transaction ${tx.id}:`, error);
          await updateTransactionStatus(tx.id, 'failed', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } finally {
      setOfflineStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [offlineStatus.isOnline, offlineStatus.isSyncing, queuedTransactions, updateTransactionStatus, removeTransaction]);

  // Process individual transaction (to be implemented by each app)
  const processTransaction = useCallback(async (transaction: OfflineTransaction): Promise<boolean> => {
    // This is a placeholder - each app should implement its own transaction processing
    console.log('Processing offline transaction:', transaction);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success/failure based on transaction type
    return Math.random() > 0.2; // 80% success rate
  }, []);

  // Retry failed transactions
  const retryFailedTransactions = useCallback(async (): Promise<void> => {
    const failedTxs = queuedTransactions.filter(tx =>
      tx.status === 'failed' && tx.retryCount < tx.maxRetries
    );

    for (const tx of failedTxs) {
      await updateTransactionStatus(tx.id, 'pending');
    }
  }, [queuedTransactions, updateTransactionStatus]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setOfflineStatus(prev => ({
        ...prev,
        isOnline: true,
        lastOnline: Date.now(),
        connectionQuality: 'good'
      }));
    };

    const handleOffline = () => {
      setOfflineStatus(prev => ({
        ...prev,
        isOnline: false,
        connectionQuality: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load queued transactions on mount
  useEffect(() => {
    getQueuedTransactions().catch(console.error);
  }, [getQueuedTransactions]);

  // Auto-sync when coming online
  useEffect(() => {
    if (offlineStatus.isOnline && !offlineStatus.isSyncing) {
      const syncTimer = setTimeout(() => {
        syncTransactions().catch(console.error);
      }, 2000); // Wait 2 seconds after coming online

      return () => clearTimeout(syncTimer);
    }
  }, [offlineStatus.isOnline, offlineStatus.isSyncing, syncTransactions]);

  // Auto-retry failed transactions periodically
  useEffect(() => {
    const retryInterval = setInterval(() => {
      if (offlineStatus.isOnline) {
        retryFailedTransactions().catch(console.error);
      }
    }, 30000); // Retry every 30 seconds

    return () => clearInterval(retryInterval);
  }, [offlineStatus.isOnline, retryFailedTransactions]);

  return {
    offlineStatus,
    queuedTransactions,
    queueTransaction,
    syncTransactions,
    retryFailedTransactions,
    removeTransaction
  };
};