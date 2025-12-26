"use client";

import React from 'react';
import { usePOS } from '@/contexts/POSContext';
import { UniversalHeader } from '@/components/shared/UniversalHeader';

export const POSHeaderWrapper = () => {
    const { isOnline, unsyncedCount } = usePOS();

    let status: 'online' | 'offline' | 'syncing' = 'online';

    if (!isOnline) {
        status = 'offline';
    } else if (unsyncedCount > 0) {
        status = 'syncing';
    }

    return (
        <UniversalHeader
            appName="POS System"
            status={status}
            lastSynced={status === 'online' ? 'Just now' : undefined}
        />
    );
};
