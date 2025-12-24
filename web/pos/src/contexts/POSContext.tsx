/**
 * POS Context - Global State Management for Event-Based POS
 * 
 * Provides EventEngine, LocalLedger, SyncWorker, RecipeEngine, CashEngine 
 * and JournalEngine to all components via React Context
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { EventEngine } from '@/lib/events/EventEngine';
import { LocalLedger } from '@/lib/storage/LocalLedger';
import { SyncWorker } from '@/lib/sync/SyncWorker';
import { RecipeEngine } from '@/lib/inventory/RecipeEngine';
import { CashEngine } from '@/lib/cash/CashEngine';
import { JournalEngine } from '@/lib/accounting/JournalEngine';
import { ReputationEngine } from '@/lib/trust/ReputationEngine';
import { IntelligenceEngine } from '@/lib/intelligence/IntelligenceEngine';

interface POSContextType {
    eventEngine: EventEngine | null;
    localLedger: LocalLedger | null;
    syncWorker: SyncWorker | null;
    recipeEngine: RecipeEngine | null;
    cashEngine: CashEngine | null;
    journalEngine: JournalEngine | null;
    reputationEngine: ReputationEngine | null;
    intelligenceEngine: IntelligenceEngine | null;
    isInitialized: boolean;
    isOnline: boolean;
    unsyncedCount: number;
    deviceId: string;
    branchId: string;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const usePOS = () => {
    const context = useContext(POSContext);
    if (!context) {
        throw new Error('usePOS must be used within POSProvider');
    }
    return context;
};

export function POSProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    // Device and branch identification
    const [deviceId] = useState(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('nilelink_device_id');
            if (!id) {
                id = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('nilelink_device_id', id);
            }
            return id;
        }
        return 'device-unknown';
    });

    const [branchId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('nilelink_branch_id') || 'branch-cairo-grill';
        }
        return 'branch-unknown';
    });

    // Initialize engines
    const [engines, setEngines] = useState<{
        eventEngine: EventEngine | null;
        localLedger: LocalLedger | null;
        syncWorker: SyncWorker | null;
        recipeEngine: RecipeEngine | null;
        cashEngine: CashEngine | null;
        journalEngine: JournalEngine | null;
        reputationEngine: ReputationEngine | null;
        intelligenceEngine: IntelligenceEngine | null;
    }>({
        eventEngine: null,
        localLedger: null,
        syncWorker: null,
        recipeEngine: null,
        cashEngine: null,
        journalEngine: null,
        reputationEngine: null,
        intelligenceEngine: null,
    });

    useEffect(() => {
        const initializeEngines = async () => {
            try {
                // Initialize LocalLedger
                const ledger = new LocalLedger();

                // Initialize EventEngine
                const lastHash = await ledger.getLastEventHash();
                const eventEngine = new EventEngine(deviceId, branchId);
                if (lastHash) {
                    eventEngine.setLastEventHash(lastHash);
                }

                // Initialize SyncWorker
                const apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
                const syncWorker = new SyncWorker(ledger, apiEndpoint);

                // Initialize RecipeEngine
                const recipeEngine = new RecipeEngine();
                recipeEngine.seed();

                // Initialize CashEngine
                const cashEngine = new CashEngine(eventEngine);

                // Initialize JournalEngine
                const journalEngine = new JournalEngine(ledger);

                // Initialize ReputationEngine
                const reputationEngine = new ReputationEngine(ledger);

                // Initialize IntelligenceEngine
                const intelligenceEngine = new IntelligenceEngine(ledger);

                setEngines({
                    eventEngine,
                    localLedger: ledger,
                    syncWorker,
                    recipeEngine,
                    cashEngine,
                    journalEngine,
                    reputationEngine,
                    intelligenceEngine,
                });

                // Start sync worker
                syncWorker.start();

                setIsInitialized(true);
                console.log('✅ POS Engines initialized', {
                    deviceId,
                    branchId,
                    lastHash,
                });

                // Update unsynced count
                const unsyncedEvents = await ledger.getUnsyncedEvents();
                setUnsyncedCount(unsyncedEvents.length);

            } catch (error) {
                console.error('❌ Failed to initialize POS engines:', error);
            }
        };

        initializeEngines();
    }, [deviceId, branchId]);

    // Monitor connection status
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

    // Periodically update unsynced count
    useEffect(() => {
        const interval = setInterval(async () => {
            if (engines.localLedger) {
                const unsyncedEvents = await engines.localLedger.getUnsyncedEvents();
                setUnsyncedCount(unsyncedEvents.length);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [engines.localLedger]);

    return (
        <POSContext.Provider
            value={{
                ...engines,
                isInitialized,
                isOnline,
                unsyncedCount,
                deviceId,
                branchId,
            }}
        >
            {children}
        </POSContext.Provider>
    );
}
