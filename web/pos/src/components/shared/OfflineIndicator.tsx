/**
 * OfflineIndicator - Visual indicator for offline/online status
 * Shows connection quality and queued transaction count
 */

"use client";

import React from 'react';
import { useOfflineTransactions } from '@shared/hooks/useOfflineTransactions';

export const OfflineIndicator: React.FC = () => {
    const { offlineStatus, queuedTransactions } = useOfflineTransactions();

    if (offlineStatus.isOnline && queuedTransactions.length === 0) {
        return null; // Don't show anything when online with no queue
    }

    const getStatusColor = () => {
        if (!offlineStatus.isOnline) return 'bg-red-500';
        if (offlineStatus.isSyncing) return 'bg-yellow-500';
        if (queuedTransactions.length > 0) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getStatusText = () => {
        if (!offlineStatus.isOnline) return 'Offline Mode';
        if (offlineStatus.isSyncing) return 'Syncing...';
        if (queuedTransactions.length > 0) return `${queuedTransactions.length} Queued`;
        return 'Online';
    };

    const getConnectionIcon = () => {
        if (!offlineStatus.isOnline) return '📡';
        if (offlineStatus.isSyncing) return '🔄';
        if (queuedTransactions.length > 0) return '⏳';
        return '✅';
    };

    return (
        <div className={`
            fixed bottom-20 right-4 z-50
            px-4 py-2 rounded-lg shadow-lg
            ${getStatusColor()} text-white
            flex items-center gap-2
            animate-fade-in
        `}>
            <span className="text-lg">{getConnectionIcon()}</span>
            <div className="flex flex-col">
                <span className="font-semibold text-sm">{getStatusText()}</span>
                {!offlineStatus.isOnline && (
                    <span className="text-xs opacity-90">
                        Transactions will be queued
                    </span>
                )}
                {offlineStatus.isSyncing && (
                    <span className="text-xs opacity-90 animate-pulse">
                        Processing queue...
                    </span>
                )}
            </div>
        </div>
    );
};
