'use client';

import React, { useState, useEffect } from 'react';
import { systemApi } from '@/shared/utils/api';

export const HealthStatus: React.FC = () => {
    const [status, setStatus] = useState<'healthy' | 'degraded' | 'critical' | 'loading'>('loading');

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const health = await systemApi.getHealth();
                setStatus(health.status);
            } catch (error) {
                setStatus('critical');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const config = {
        healthy: { color: 'text-secondary', label: 'All Systems Normal', pulse: true },
        degraded: { color: 'text-amber-400', label: 'System Congestion', pulse: true },
        critical: { color: 'text-red-500', label: 'Incident Reported', pulse: false },
        loading: { color: 'text-white/20', label: 'Syncing...', pulse: false }
    };

    const current = config[status === 'loading' ? 'loading' : status];

    return (
        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${current.color} transition-colors duration-500`}>
            {current.pulse && (
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status === 'healthy' ? 'bg-secondary' : 'bg-amber-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'healthy' ? 'bg-secondary' : 'bg-amber-400'}`}></span>
                </span>
            )}
            {!current.pulse && status !== 'loading' && <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
            {current.label}
        </div>
    );
};
