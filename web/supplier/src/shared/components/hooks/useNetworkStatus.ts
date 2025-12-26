"use client";

import { useState, useEffect } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'syncing' | 'error';

export function useNetworkStatus() {
    const [status, setStatus] = useState<NetworkStatus>('online');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateStatus = () => {
            setStatus(navigator.onLine ? 'online' : 'offline');
        };

        // Set initial status
        updateStatus();

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    return status;
}
