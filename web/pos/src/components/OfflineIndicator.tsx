'use client';

import React from 'react';
import { Wifi, WifiOff, Clock, Database } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { usePOS } from '@/contexts/POSContext';

interface OfflineIndicatorProps {
    className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
    const { isOnline, unsyncedCount } = usePOS();
    const [lastSync, setLastSync] = React.useState<Date>(new Date());

    const formatLastSync = () => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {isOnline ? (
                <>
                    <div className="flex items-center gap-2 text-[var(--pos-success)]">
                        <Wifi size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--pos-text-muted)]">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{formatLastSync()}</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 text-[var(--pos-warning)] animate-pulse">
                        <WifiOff size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol Offline</span>
                    </div>
                </>
            )}
            
            {unsyncedCount > 0 && (
                <Badge variant="warning" className="h-6 px-3 bg-[var(--pos-warning-bg)] border-[var(--pos-warning)] text-[var(--pos-warning)] text-[8px] font-black uppercase tracking-[0.2em]">
                    <Database size={10} className="mr-1" /> {unsyncedCount} Queued
                </Badge>
            )}
        </div>
    );
};
