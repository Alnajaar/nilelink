'use client';

import React, { useState } from 'react';
import { Wifi, WifiOff, Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useOfflineTransactions, OfflineTransaction } from '../hooks/useOfflineTransactions';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showDetails = true
}) => {
  const { offlineStatus, queuedTransactions, syncTransactions } = useOfflineTransactions();
  const [showTransactionList, setShowTransactionList] = useState(false);

  const getStatusColor = () => {
    if (!offlineStatus.isOnline) return 'text-red-600 bg-red-50 border-red-200';
    if (offlineStatus.connectionQuality === 'poor') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (offlineStatus.queuedTransactions > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (!offlineStatus.isOnline) return <WifiOff className="w-4 h-4" />;
    if (offlineStatus.connectionQuality === 'poor') return <AlertTriangle className="w-4 h-4" />;
    if (offlineStatus.queuedTransactions > 0) return <Clock className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!offlineStatus.isOnline) return 'Offline - Queued for sync';
    if (offlineStatus.connectionQuality === 'poor') return 'Poor connection';
    if (offlineStatus.queuedTransactions > 0) return `${offlineStatus.queuedTransactions} queued`;
    return 'Online';
  };

  const getTransactionStatusIcon = (status: OfflineTransaction['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3 text-yellow-600" />;
      case 'processing': return <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-3 h-3 text-red-600" />;
      default: return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: OfflineTransaction['type']) => {
    switch (type) {
      case 'payment': return 'Payment';
      case 'order': return 'Order';
      case 'supplier_onboarding': return 'Supplier Registration';
      case 'inventory_update': return 'Inventory Update';
      default: return 'Transaction';
    }
  };

  const pendingTransactions = queuedTransactions.filter(tx => tx.status === 'pending');
  const failedTransactions = queuedTransactions.filter(tx => tx.status === 'failed');

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium cursor-pointer transition-colors ${getStatusColor()}`}
        onClick={() => setShowTransactionList(!showTransactionList)}
      >
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>

        {offlineStatus.isSyncing && (
          <RefreshCw className="w-3 h-3 ml-2 animate-spin" />
        )}

        {(pendingTransactions.length > 0 || failedTransactions.length > 0) && showDetails && (
          <span className="ml-2 text-xs">
            ({pendingTransactions.length} pending, {failedTransactions.length} failed)
          </span>
        )}
      </div>

      {/* Transaction Details Dropdown */}
      {showTransactionList && queuedTransactions.length > 0 && (
        <div className="absolute top-full mt-2 right-0 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Offline Transactions</h3>
              <button
                onClick={() => setShowTransactionList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {queuedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <div className="flex items-center">
                    {getTransactionStatusIcon(tx.status)}
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-900">
                        {getTransactionTypeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </p>
                      {tx.error && (
                        <p className="text-xs text-red-600 mt-1">{tx.error}</p>
                      )}
                    </div>
                  </div>

                  {tx.priority === 'high' && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      High Priority
                    </span>
                  )}
                </div>
              ))}
            </div>

            {offlineStatus.isOnline && !offlineStatus.isSyncing && pendingTransactions.length > 0 && (
              <button
                onClick={() => syncTransactions()}
                className="mt-3 w-full bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Sync Now
              </button>
            )}

            {offlineStatus.isSyncing && (
              <div className="mt-3 flex items-center justify-center text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Syncing transactions...
              </div>
            )}

            {!offlineStatus.isOnline && (
              <div className="mt-3 text-center text-sm text-gray-600">
                Transactions will sync automatically when connection is restored
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;