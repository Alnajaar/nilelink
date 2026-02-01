'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StaffEngine } from '@/lib/staff/StaffEngine';
import { productInventoryEngine } from '@/lib/core/ProductInventoryEngine';
import { LocalLedger } from '@/lib/storage/LocalLedger';
import { StaffMember } from '@/lib/staff/StaffEngine';
import { OrderSyncService } from '@shared/services/OrderSyncService';
import { CashEngine } from '@/lib/cash/CashEngine';
import { JournalEngine } from '@/lib/accounting/JournalEngine';
import { EventEngine } from '@/lib/events/EventEngine';
import { HardwareMonitor } from '@/lib/hardware/HardwareMonitor';
import { InventorySyncEngine } from '@/lib/sync/InventorySyncEngine';
import { useAuth } from '@shared/providers/AuthProvider';
import { PayrollEngine } from '@/lib/payroll/PayrollEngine';
import { procurementEngine } from '@/lib/supplier/ProcurementEngine';

// Define the context type
interface POSContextType {
  engines: {
    staffEngine: StaffEngine;
    productEngine: typeof productInventoryEngine;
    orderEngine: any; // Using any temporarily since we don't have the specific order engine
    cashEngine: CashEngine;
    journalEngine: JournalEngine;
    eventEngine: EventEngine;
    hardwareMonitor: HardwareMonitor;
    inventorySyncEngine: InventorySyncEngine;
    payrollEngine: PayrollEngine;
    procurementEngine: typeof procurementEngine;
  };
  currentStaff: StaffMember | null;
  branchId: string;
  restaurantId: string;
  setRestaurantId: (id: string) => void;
  isOnline: boolean;
  isInitialized: boolean;
  currentRole: string | null;
  loginWithPin: (uniqueCode: string, pin: string) => Promise<boolean>;
  loginWithSIWE: () => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// Create the context
const POSContext = createContext<POSContextType | undefined>(undefined);

// Props type for the provider
interface POSProviderProps {
  children: ReactNode;
}

// Provider component
export const POSProvider: React.FC<POSProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [branchId] = useState<string>('branch-cairo-grill'); // Default branch
  const [restaurantId, setRestaurantId] = useState<string>(user?.businessId || ''); // Sync with auth

  // Initialize engines
  const localLedger = new LocalLedger();
  const staffEngine = new StaffEngine(localLedger);
  const productEngine = productInventoryEngine;
  const eventEngine = new EventEngine('POS-DEVICE-01', branchId, localLedger);
  const cashEngine = new CashEngine(eventEngine, localLedger);
  const journalEngine = new JournalEngine(localLedger);
  const [hardwareMonitor, setHardwareMonitor] = useState<HardwareMonitor | null>(null);

  const orderSyncService = OrderSyncService.getInstance();
  const inventorySyncEngine = new InventorySyncEngine(localLedger, eventEngine);
  const payrollEngine = new PayrollEngine(localLedger);

  useEffect(() => {
    const monitor = HardwareMonitor.getInstance();
    if (monitor) setHardwareMonitor(monitor);
  }, []);

  // Initialize engines
  useEffect(() => {
    const initializeEngines = async () => {
      try {
        await productEngine.initialize();
        await staffEngine.seedDefaultAdmin(branchId);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize POS engines:', error);
      }
    };

    initializeEngines();
  }, [branchId]);

  // Sync restaurantId with user businessId
  useEffect(() => {
    if (user?.businessId && user.businessId !== restaurantId) {
      setRestaurantId(user.businessId);
    }
  }, [user, restaurantId]);

  // Login with PIN
  const loginWithPin = async (uniqueCode: string, pin: string): Promise<boolean> => {
    try {
      const staff = await staffEngine.verifyPin(uniqueCode, pin);
      if (staff) {
        setCurrentStaff(staff);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PIN login failed:', error);
      return false;
    }
  };

  // Login with SIWE (Sign-In With Ethereum)
  const loginWithSIWE = async (): Promise<boolean> => {
    // Implementation would connect to wallet and authenticate
    // For now, returning false as placeholder
    console.warn('SIWE login not implemented in this context');
    return false;
  };

  // Logout
  const logout = () => {
    setCurrentStaff(null);
  };

  // Check permissions
  const hasPermission = (permission: string): boolean => {
    if (!currentStaff) return false;
    return currentStaff.permissions.includes(permission as any);
  };

  // Current role
  const currentRole = currentStaff ? currentStaff.roles[0] : null;

  const value: POSContextType = {
    engines: {
      staffEngine,
      productEngine,
      orderEngine: orderSyncService, // Using order sync service as order engine
      cashEngine,
      journalEngine,
      eventEngine,
      hardwareMonitor: hardwareMonitor as any,
      inventorySyncEngine,
      payrollEngine,
      procurementEngine
    },
    currentStaff,
    branchId,
    restaurantId,
    setRestaurantId,
    isOnline,
    isInitialized,
    currentRole,
    loginWithPin,
    loginWithSIWE,
    logout,
    hasPermission
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};

// Custom hook to use the POS context
export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

