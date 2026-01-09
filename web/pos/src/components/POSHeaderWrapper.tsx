"use client";

import React from 'react';
import { usePOS } from '@/contexts/POSContext';
import { UniversalHeader } from '@/components/shared/UniversalHeader';
import { Badge } from '@/shared/components/Badge';

export const POSHeaderWrapper = () => {
    const { isOnline, unsyncedCount, demoMode, setDemoMode } = usePOS();

    let status: 'online' | 'offline' | 'syncing' = 'online';

    if (!isOnline) {
        status = 'offline';
    } else if (unsyncedCount > 0) {
        status = 'syncing';
    }

    return (
        <div>
            {demoMode && (
                <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-bold uppercase tracking-widest">
                    🚧 DEMO MODE - No Real Transactions 🚧
                    <button
                        onClick={() => setDemoMode(false)}
                        className="ml-4 underline hover:no-underline"
                    >
                        Switch to Live Mode
                    </button>
                </div>
            )}
            <UniversalHeader
                appName="POS System"
                status={status}
                lastSynced={status === 'online' ? 'Just now' : undefined}
            />
        </div>
    );
};
