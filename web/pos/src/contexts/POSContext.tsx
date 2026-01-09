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
import { StaffEngine, StaffMember } from '@/lib/staff/StaffEngine';
import { hardwareMonitor } from '@/lib/hardware/HardwareMonitor';
import { stockSync } from '@shared/engines/StockSyncEngine';

import { POS_ROLE, PERMISSION, hasPermission } from '@/utils/permissions';

interface POSContextType {
    eventEngine: EventEngine | null;
    localLedger: LocalLedger | null;
    syncWorker: SyncWorker | null;
    recipeEngine: RecipeEngine | null;
    cashEngine: CashEngine | null;
    journalEngine: JournalEngine | null;
    reputationEngine: ReputationEngine | null;
    intelligenceEngine: IntelligenceEngine | null;
    staffEngine: StaffEngine | null;
    isInitialized: boolean;
    isOnline: boolean;
    unsyncedCount: number;
    deviceId: string;
    branchId: string;
    currentRole: POS_ROLE | null;
    currentStaff: StaffMember | null;
    setCurrentRole: (role: POS_ROLE | null) => void;
    loginWithPin: (code: string, pin: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: PERMISSION) => boolean;
    demoMode: boolean;
    setDemoMode: (mode: boolean) => void;
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
    const [currentRole, setCurrentRole] = useState<POS_ROLE | null>(null);
    const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
    const [demoMode, setDemoMode] = useState(true);
    const [deviceId, setDeviceId] = useState('device-initializing');
    const [branchId, setBranchId] = useState('branch-initializing');
    const [mounted, setMounted] = useState(false);

    // Initial load from local storage after mount
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const savedDemo = localStorage.getItem('nilelink_demo_mode');
            if (savedDemo === 'false') setDemoMode(false);

            let savedId = localStorage.getItem('nilelink_device_id');
            if (!savedId) {
                savedId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('nilelink_device_id', savedId);
            }
            setDeviceId(savedId);

            const savedBranch = localStorage.getItem('nilelink_branch_id') || 'branch-cairo-grill';
            setBranchId(savedBranch);

            // Staff session hydration (Phase 10)
            const savedStaffId = sessionStorage.getItem('pos_staff_id');
            if (savedStaffId && engines.staffEngine) {
                engines.localLedger?.getStaffById(savedStaffId).then(staff => {
                    if (staff) {
                        setCurrentStaff(staff);
                        setCurrentRole(staff.roles[0]);
                        engines.eventEngine?.setDefaultActor(staff.id);
                    }
                });
            }
        }
    }, [engines.staffEngine, engines.localLedger]);

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
        staffEngine: StaffEngine | null;
        hardwareMonitor: HardwareMonitor | null;
    }>({
        eventEngine: null,
        localLedger: null,
        syncWorker: null,
        recipeEngine: null,
        cashEngine: null,
        journalEngine: null,
        reputationEngine: null,
        intelligenceEngine: null,
        staffEngine: null,
        hardwareMonitor: null,
    });

    useEffect(() => {
        const initializeEngines = async () => {
            try {
                // Initialize LocalLedger
                const ledger = new LocalLedger();

                // Initialize EventEngine
                const lastHash = await ledger.getLastEventHash();
                const eventEngine = new EventEngine(deviceId, branchId, ledger);
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
                const cashEngine = new CashEngine(eventEngine, ledger);

                // Subscribe StockSyncEngine (Phase 12 Ecosystem Intelligence)
                eventEngine.onEvent((event) => stockSync.processEvent(event));

                // Initialize JournalEngine
                const journalEngine = new JournalEngine(ledger);

                // Initialize ReputationEngine
                const reputationEngine = new ReputationEngine(ledger);

                // Initialize IntelligenceEngine
                const intelligenceEngine = new IntelligenceEngine(ledger);

                // Initialize StaffEngine
                const staffEngine = new StaffEngine(ledger);
                await staffEngine.seedDefaultAdmin(branchId);

                // Initialize HardwareMonitor
                const hwMonitor = hardwareMonitor;

                setEngines({
                    eventEngine,
                    localLedger: ledger,
                    syncWorker,
                    recipeEngine,
                    cashEngine,
                    journalEngine,
                    reputationEngine,
                    intelligenceEngine,
                    staffEngine,
                    hardwareMonitor: hwMonitor,
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

    const checkPermission = (permission: PERMISSION): boolean => {
        // If we have a current staff member, check their granular permissions
        if (currentStaff) {
            return currentStaff.permissions.includes(permission);
        }

        // Fallback to role-based check
        if (!currentRole) return false;
        return hasPermission(currentRole, permission);
    };

    const loginWithPin = async (code: string, pin: string): Promise<boolean> => {
        if (!engines.staffEngine) return false;

        const staff = await engines.staffEngine.verifyPin(code, pin);
        if (staff) {
            setCurrentStaff(staff);
            setCurrentRole(staff.roles[0]); // Primary role

            // Set actor in event engine (Phase 10)
            engines.eventEngine?.setDefaultActor(staff.id);

            // Persist session locally
            sessionStorage.setItem('pos_staff_id', staff.id);
            sessionStorage.setItem('pos_current_role', staff.roles[0]);

            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentStaff(null);
        setCurrentRole(null);
        engines.eventEngine?.setDefaultActor('system');
        sessionStorage.removeItem('pos_staff_id');
        sessionStorage.removeItem('pos_current_role');
    };

    return (
        <POSContext.Provider
            value={{
                ...engines,
                isInitialized,
                isOnline,
                unsyncedCount,
                deviceId,
                branchId,
                currentRole,
                currentStaff,
                setCurrentRole,
                loginWithPin,
                logout,
                hasPermission: checkPermission,
                demoMode,
                setDemoMode,
            }}
        >
            {children}
        </POSContext.Provider>
    );
}
