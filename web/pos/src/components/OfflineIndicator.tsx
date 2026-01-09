'use client';

import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';

interface OfflineIndicatorProps {
    className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
    const [isOnline, setIsOnline] = React.useState(true);
    const [pendingSync, setPendingSync] = React.useState(0);
    const [lastSync, setLastSync] = React.useState<Date>(new Date());

    React.useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);

        updateOnlineStatus();
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const formatLastSync = () => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {isOnline ? (
                <>
                    <div className="flex items-center gap-2 text-success">
                        <Wifi size={16} />
                        <span className="text-xs font-medium">Online</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={12} />
                        <span>{formatLastSync()}</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2 text-warning">
                        <WifiOff size={16} />
                        <span className="text-xs font-medium">Offline</span>
                    </div>
                    {pendingSync > 0 && (
                        <Badge size="sm" variant="warning">
                            {pendingSync} pending
                        </Badge>
                    )}
                </>
            )}
        </div>
    );
};
