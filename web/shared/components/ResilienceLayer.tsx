/**
 * NileLink Resilience Layer
 * centralized error & status management
 * 
 * FEATURES:
 * - Protocol Status Banner (Indexer lag, RPC latency)
 * - Offline Connectivity Guard (UI indicator)
 * - Premium Error Boundaries
 * - High-end 'Access Denied' overlays for RBAC
 */

'use client';

import React, { useState, useEffect } from 'react';

// ============================================
// TYPES
// ============================================

interface ResilienceProps {
    status?: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
    latency?: number; // ms
    isOnline: boolean;
}

// ============================================
// MAIN COMPONENTS
// ============================================

/**
 * Global Network Status Banner
 * Sticky indicator for protocol health
 */
export const ProtocolStatusBanner = () => {
    const [status, setStatus] = useState<ResilienceProps['status']>('OPERATIONAL');
    const [lag, setLag] = useState(0);

    useEffect(() => {
        // TODO: Poll GraphService.getHealth()
        // Simulated indexer check
        const interval = setInterval(() => {
            const mockLag = Math.floor(Math.random() * 5);
            setLag(mockLag);
            setStatus(mockLag > 3 ? 'DEGRADED' : 'OPERATIONAL');
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    if (status === 'OPERATIONAL') return null;

    return (
        <div className={`fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center backdrop-blur-md border-b flex items-center justify-center gap-4 transition-all duration-500 ${status === 'DEGRADED' ? 'bg-orange-600/20 border-orange-500/30 text-orange-400' : 'bg-red-600/20 border-red-500/30 text-red-400'
            }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">
                {status === 'DEGRADED' ? `Protocol Indexing behind by ${lag} blocks` : 'Network undergoing maintenance'}
            </span>
        </div>
    );
};

/**
 * Access Denied / Permission Error
 */
export const PermissionGuardScreen = ({ requiredPermission }: { requiredPermission: string }) => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-8">
            <div className="text-center max-w-md bg-white/5 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-3xl">
                <div className="text-7xl mb-8 opacity-20 group-hover:opacity-100 transition-all">🔒</div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4">Access Restricted</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-12">
                    You do not have the <span className="text-blue-400 font-mono">"{requiredPermission}"</span> permission required to access this protocol node.
                    Please contact your administrator or upgrade your plan.
                </p>
                <button
                    onClick={() => history.back()}
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
                >
                    Return to Safety
                </button>
            </div>
        </div>
    );
};

/**
 * Connectivity indicator
 */
export const ConnectivityBadge = () => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-4 animate-bounce">
            <span>Offline Mode</span>
            <span className="text-sm">⚠️</span>
        </div>
    );
};
