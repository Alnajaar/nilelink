import React from 'react';
import { Badge } from './Badge';

interface StateIndicatorProps {
    status: 'online' | 'offline' | 'syncing' | 'error';
    lastSynced?: string;
}

export const StateIndicator: React.FC<StateIndicatorProps> = ({ status, lastSynced }) => {
    const config = {
        online: { variant: 'success' as const, label: 'Systems Online', icon: '🟢' },
        offline: { variant: 'error' as const, label: 'Offline Mode', icon: '🔴' },
        syncing: { variant: 'warning' as const, label: 'Syncing...', icon: '🟡' },
        error: { variant: 'error' as const, label: 'Sync Error', icon: '⚠️' },
    };

    const { variant, label, icon } = config[status] || config.offline;

    return (
        <div className="flex items-center gap-2">
            <Badge variant={variant} className="gap-1.5 shadow-sm">
                <span className="text-[10px]">{icon}</span>
                {label}
            </Badge>
            {lastSynced && status === 'online' && (
                <span className="text-xs text-primary-dark/50 hidden sm:inline-block">
                    Synced {lastSynced}
                </span>
            )}
        </div>
    );
};
