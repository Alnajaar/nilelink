'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@shared/components/Badge';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface OfflineStatusProps {
    syncStatus?: {
        pending: number;
        synced: number;
        failed: number;
        conflicts: number;
    };
    aiReady?: boolean;
    onManualSync?: () => void;
}

export function OfflineStatusIndicator({ syncStatus, aiReady, onManualSync }: OfflineStatusProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = () => {
        if (onManualSync) {
            onManualSync();
            setLastSyncTime(new Date());
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {/* Online/Offline Status */}
            <div
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border backdrop-blur-md transition-all",
                    isOnline
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                )}
            >
                {isOnline ? (
                    <>
                        <Wifi className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Offline</span>
                    </>
                )}
            </div>

            {/* Sync Status */}
            {syncStatus && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sync Queue</span>
                        {isOnline && (
                            <button
                                onClick={handleSync}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Manual sync"
                            >
                                <RefreshCw className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-1">
                        {syncStatus.pending > 0 && (
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-yellow-400" />
                                    <span className="text-gray-400">Pending</span>
                                </div>
                                <span className="font-bold text-yellow-400">{syncStatus.pending}</span>
                            </div>
                        )}

                        {syncStatus.synced > 0 && (
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                    <span className="text-gray-400">Synced</span>
                                </div>
                                <span className="font-bold text-green-400">{syncStatus.synced}</span>
                            </div>
                        )}

                        {syncStatus.failed > 0 && (
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                    <span className="text-gray-400">Failed</span>
                                </div>
                                <span className="font-bold text-red-400">{syncStatus.failed}</span>
                            </div>
                        )}

                        {syncStatus.conflicts > 0 && (
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-orange-400" />
                                    <span className="text-gray-400">Conflicts</span>
                                </div>
                                <span className="font-bold text-orange-400">{syncStatus.conflicts}</span>
                            </div>
                        )}
                    </div>

                    {lastSyncTime && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                            <span className="text-[8px] text-gray-500">
                                Last sync: {lastSyncTime.toLocaleTimeString()}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* AI Status */}
            {aiReady !== undefined && (
                <Badge
                    className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        aiReady
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}
                >
                    AI: {aiReady ? 'Ready' : 'Loading...'}
                </Badge>
            )}
        </div>
    );
}
