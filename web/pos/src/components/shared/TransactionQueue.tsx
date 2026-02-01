/**
 * TransactionQueue - UI to view and manage offline transaction queue
 */

"use client";

import React, { useState } from 'react';
import { useOfflineTransactions, OfflineTransaction } from '@shared/hooks/useOfflineTransactions';

export const TransactionQueue: React.FC = () => {
    const { queuedTransactions, syncTransactions, retryFailedTransactions, removeTransaction, offlineStatus } = useOfflineTransactions();
    const [isExpanded, setIsExpanded] = useState(false);

    if (queuedTransactions.length === 0) {
        return null;
    }

    const getStatusIcon = (status: OfflineTransaction['status']) => {
        switch (status) {
            case 'completed': return '✅';
            case 'failed': return '❌';
            case 'processing': return '⏳';
            case 'pending': return '📝';
            default: return '❓';
        }
    };

    const getPriorityColor = (priority: OfflineTransaction['priority']) => {
        switch (priority) {
            case 'critical': return 'text-red-600 font-bold';
            case 'high': return 'text-orange-600 font-semibold';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const formatTransactionType = (type: string) => {
        return type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed bottom-4 right-4 z-40 w-96">
            {/* Queue Header */}
            <div
                className="glass-v2 rounded-t-lg px-4 py-3 cursor-pointer flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <span className="font-semibold">Transaction Queue</span>
                    <span className="badge-info">{queuedTransactions.length}</span>
                </div>
                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </div>

            {/* Queue Contents */}
            {isExpanded && (
                <div className="glass-v2 rounded-b-lg max-h-96 overflow-y-auto">
                    {/* Action Buttons */}
                    <div className="px-4 py-2 border-b border-white/10 flex gap-2">
                        <button
                            onClick={() => syncTransactions()}
                            disabled={!offlineStatus.isOnline || offlineStatus.isSyncing}
                            className="btn-secondary text-sm flex-1"
                        >
                            {offlineStatus.isSyncing ? '🔄 Syncing...' : '🔄 Sync Now'}
                        </button>
                        <button
                            onClick={() => retryFailedTransactions()}
                            className="btn-secondary text-sm"
                        >
                            🔁 Retry
                        </button>
                    </div>

                    {/* Transaction List */}
                    <div className="divide-y divide-white/10">
                        {queuedTransactions.map((tx) => (
                            <div key={tx.id} className="px-4 py-3 hover:bg-white/5 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span>{getStatusIcon(tx.status)}</span>
                                            <span className="font-medium truncate">
                                                {formatTransactionType(tx.type)}
                                            </span>
                                            <span className={`text-xs ${getPriorityColor(tx.priority)}`}>
                                                {tx.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {formatTimestamp(tx.timestamp)}
                                        </div>
                                        {tx.error && (
                                            <div className="text-xs text-red-400 mt-1 truncate">
                                                Error: {tx.error}
                                            </div>
                                        )}
                                        {tx.retryCount > 0 && (
                                            <div className="text-xs text-orange-400 mt-1">
                                                Retries: {tx.retryCount}/{tx.maxRetries}
                                            </div>
                                        )}
                                    </div>

                                    {tx.status === 'completed' && (
                                        <button
                                            onClick={() => removeTransaction(tx.id)}
                                            className="text-xs text-gray-400 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {queuedTransactions.length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-400">
                            <div className="text-4xl mb-2">📭</div>
                            <div>No queued transactions</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
