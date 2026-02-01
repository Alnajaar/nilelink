/**
 * NileLink Scanner Manager
 *
 * Manages barcode scanner hardware integration with security validation:
 * - Scanner-to-cashier station assignment and authentication
 * - Duplicate scan prevention within transactions
 * - Mid-transaction failure recovery with state saving
 * - Manual item entry fallback mechanisms
 * - Hardware health monitoring and failover
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import { TheftPreventionEngine } from '../security/TheftPreventionEngine';
import { CashierSessionManager } from '../security/CashierSessionManager';
import {
    EventType,
    ItemScannedEvent,
    ScanDuplicateDetectedEvent
} from '../events/types';
import { IScannerHAL, VirtualScannerDriver, HALDeviceType, HALProtocol } from './hal/HAL';
import { v4 as uuidv4 } from 'uuid';

export interface ScannerDevice {
    id: string;
    type: 'usb' | 'serial' | 'bluetooth' | 'camera' | 'virtual';
    name: string;
    assignedStationId: string;
    assignedCashierId?: string;
    isActive: boolean;
    lastSeen: number;
    supportedFormats: string[];
    config: ScannerConfig;
    hal: IScannerHAL; // Standardized hardware driver
}

export interface ScannerConfig {
    timeout: number;
    beepOnScan: boolean;
    vibrateOnScan: boolean;
    autoSubmit: boolean;
    duplicatePrevention: boolean;
}

export interface ScanResult {
    success: boolean;
    productId?: string;
    productName?: string;
    barcode?: string;
    quantity?: number;
    unitPrice?: number;
    weight?: number;
    error?: string;
    duplicate?: boolean;
    requiresManualEntry?: boolean;
}

export class ScannerManager {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private theftPreventionEngine: TheftPreventionEngine;
    private cashierSessionManager: CashierSessionManager;
    private scanners = new Map<string, ScannerDevice>();
    private activeScans = new Map<string, ScanSession>();

    // Configuration
    private readonly SCAN_TIMEOUT = 30000; // 30 seconds
    private readonly MAX_RETRIES = 3;

    constructor(
        eventEngine: EventEngine,
        ledger: LocalLedger,
        theftPreventionEngine: TheftPreventionEngine,
        cashierSessionManager: CashierSessionManager
    ) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.theftPreventionEngine = theftPreventionEngine;
        this.cashierSessionManager = cashierSessionManager;
        this.initializeScanners();
    }

    /**
     * Initialize scanner devices
     */
    private initializeScanners(): void {
        // Initialize drivers
        const scanner1HAL = new VirtualScannerDriver();
        const scanner2HAL = new VirtualScannerDriver();

        const defaultScanners: ScannerDevice[] = [
            {
                id: 'scanner_station_1',
                type: 'usb',
                name: 'Station 1 USB Scanner',
                assignedStationId: 'station_1',
                isActive: true,
                lastSeen: Date.now(),
                supportedFormats: ['EAN-13', 'UPC-A', 'Code 128'],
                config: {
                    timeout: this.SCAN_TIMEOUT,
                    beepOnScan: true,
                    vibrateOnScan: false,
                    autoSubmit: true,
                    duplicatePrevention: true,
                },
                hal: scanner1HAL
            },
            {
                id: 'scanner_station_2',
                type: 'bluetooth',
                name: 'Station 2 Bluetooth Scanner',
                assignedStationId: 'station_2',
                isActive: true,
                lastSeen: Date.now(),
                supportedFormats: ['EAN-13', 'UPC-A', 'QR Code'],
                config: {
                    timeout: this.SCAN_TIMEOUT,
                    beepOnScan: true,
                    vibrateOnScan: true,
                    autoSubmit: true,
                    duplicatePrevention: true,
                },
                hal: scanner2HAL
            }
        ];

        for(const scanner of defaultScanners) {
            this.scanners.set(scanner.id, scanner);

            // Connect to hardware via HAL
            scanner.hal.connect();

            // Subscribe to scan events via HAL
            scanner.hal.onData(async (data) => {
                const barcode = typeof data === 'string' ? data : new TextDecoder().decode(data);

                // Log scan event (in production, this would integrate with POS session management)
                console.log(`[ScannerManager] Received scan from HAL on ${scanner.id}: ${barcode}`);

                // TODO: Integrate with active POS session when UI is implemented
                // const session = this.getActiveSessionForScanner(scanner.id);
                // if (session) {
                //     await this.processScan(scanner.id, barcode, session.transactionId, session.id);
                // }
            });
        }

        console.log('✅ Scanner Manager initialized with', this.scanners.size, 'devices using HAL');
    }

    /**
     * Process a barcode scan
     */
    async processScan(
    scannerId: string,
    barcode: string,
    transactionId: string,
    sessionId: string,
    quantity: number = 1
): Promise < ScanResult > {
    try {
        // Validate scanner and session
        const validation = await this.validateScanRequest(scannerId, sessionId, transactionId);
        if(!validation.valid) {
    return {
        success: false,
        error: validation.error
    };
}

const scanner = this.scanners.get(scannerId)!;

// Update scanner activity
scanner.lastSeen = Date.now();

// Lookup product (in real implementation, this would query inventory)
const product = await this.lookupProduct(barcode);
if (!product) {
    return {
        success: false,
        error: 'Product not found',
        requiresManualEntry: true,
        barcode
    };
}

// Check for duplicates via TheftPreventionEngine
const duplicateCheck = await this.theftPreventionEngine.recordScannedItem(
    transactionId,
    product.id,
    product.name,
    barcode,
    quantity,
    product.price,
    product.weight || undefined,
    scannerId,
    validation.cashierId!
);

if (!duplicateCheck.allowed) {
    // Create duplicate detection event (already done in TheftPreventionEngine)
    return {
        success: false,
        error: 'Duplicate item scan detected',
        duplicate: true,
        productId: product.id,
        productName: product.name,
        barcode
    };
}

// Start scan session for timeout tracking
this.startScanSession(transactionId, scannerId, barcode);

return {
    success: true,
    productId: product.id,
    productName: product.name,
    barcode,
    quantity,
    unitPrice: product.price,
    weight: product.weight
};

        } catch (error) {
    console.error('Scan processing failed:', error);
    return {
        success: false,
        error: 'Scan processing failed',
        requiresManualEntry: true,
        barcode
    };
}
    }

    /**
     * Manually enter an item (fallback for scanner failures)
     */
    async manualItemEntry(
    transactionId: string,
    sessionId: string,
    productData: {
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    weight?: number;
}
): Promise < ScanResult > {
    try {
        // Validate session
        const session = this.cashierSessionManager.getSession(sessionId);
        if(!session || !session.isActive) {
    return {
        success: false,
        error: 'Invalid or inactive session'
    };
}

// Use TheftPreventionEngine to record the item
const duplicateCheck = await this.theftPreventionEngine.recordScannedItem(
    transactionId,
    productData.productId,
    productData.productName,
    productData.barcode,
    productData.quantity,
    productData.unitPrice,
    productData.weight,
    'manual_entry', // Special scanner ID for manual entry
    session.cashierId
);

if (!duplicateCheck.allowed) {
    return {
        success: false,
        error: 'Duplicate item detected',
        duplicate: true
    };
}

return {
    success: true,
    productId: productData.productId,
    productName: productData.productName,
    barcode: productData.barcode,
    quantity: productData.quantity,
    unitPrice: productData.unitPrice,
    weight: productData.weight
};

        } catch (error) {
    console.error('Manual entry failed:', error);
    return {
        success: false,
        error: 'Manual entry failed'
    };
}
    }

    /**
     * Recover from mid-transaction scanner failure
     */
    async recoverTransactionState(
    transactionId: string,
    sessionId: string
): Promise < { recoverable: boolean; state?: TransactionRecoveryState } > {
    try {
        // Validate session ownership
        const ownsTransaction = this.cashierSessionManager.validateTransactionOwnership(
            sessionId,
            transactionId
        );

        if(!ownsTransaction) {
            return { recoverable: false };
        }

            // Get current transaction state from TheftPreventionEngine
            const securityState = this.theftPreventionEngine.getTransactionState(transactionId);
        if(!securityState) {
            return { recoverable: false };
        }

            const recoveryState: TransactionRecoveryState = {
            transactionId,
            scannedItems: Array.from(securityState.scannedItems.values()),
            totalExpectedWeight: securityState.totalExpectedWeight,
            isLocked: securityState.isLocked,
            bagVerified: securityState.bagVerified,
            lastActivity: securityState.lastActivity
        };

        return {
            recoverable: true,
            state: recoveryState
        };

    } catch(error) {
        console.error('Transaction recovery failed:', error);
        return { recoverable: false };
    }
}

    /**
     * Validate scan request
     */
    private async validateScanRequest(
    scannerId: string,
    sessionId: string,
    transactionId: string
): Promise < { valid: boolean; error?: string; cashierId?: string } > {
    // Check if scanner exists and is active
    const scanner = this.scanners.get(scannerId);
    if(!scanner || !scanner.isActive) {
    return { valid: false, error: 'Scanner not found or inactive' };
}

// Check session
const session = this.cashierSessionManager.getSession(sessionId);
if (!session || !session.isActive) {
    return { valid: false, error: 'Invalid or inactive session' };
}

// Validate scanner-to-cashier assignment
if (scanner.assignedCashierId && scanner.assignedCashierId !== session.cashierId) {
    return { valid: false, error: 'Scanner not assigned to this cashier' };
}

// Validate transaction ownership
const ownsTransaction = this.cashierSessionManager.validateTransactionOwnership(
    sessionId,
    transactionId
);

if (!ownsTransaction) {
    return { valid: false, error: 'Session does not own this transaction' };
}

return { valid: true, cashierId: session.cashierId };
    }

    /**
     * Lookup product by barcode (mock implementation)
     */
    private async lookupProduct(barcode: string): Promise < ProductData | null > {
    // In a real implementation, this would query the inventory system
    // For now, return mock data based on barcode
    const mockProducts: Record<string, ProductData> = {
    '123456789012': {
        id: 'prod_1',
            name: 'Milk 1L',
                price: 15.50,
                    weight: 1.05
    },
    '987654321098': {
        id: 'prod_2',
            name: 'Bread Loaf',
                price: 8.75,
                    weight: 0.45
    },
    '555666777888': {
        id: 'prod_3',
            name: 'Apples 1kg',
                price: 25.00,
                    weight: 1.0
    }
};

return mockProducts[barcode] || null;
    }

    /**
     * Start scan session for timeout tracking
     */
    private startScanSession(transactionId: string, scannerId: string, barcode: string): void {
    const scanSession: ScanSession = {
        id: uuidv4(),
        transactionId,
        scannerId,
        barcode,
        startTime: Date.now(),
        timeout: setTimeout(() => {
            this.handleScanTimeout(scanSession.id);
        }, this.SCAN_TIMEOUT)
    };

    this.activeScans.set(scanSession.id, scanSession);
}

    /**
     * Handle scan timeout
     */
    private handleScanTimeout(scanSessionId: string): void {
    const session = this.activeScans.get(scanSessionId);
    if(session) {
        console.warn(`Scan session ${scanSessionId} timed out`);
        this.activeScans.delete(scanSessionId);
    }
}

/**
 * Get scanner by ID
 */
getScanner(scannerId: string): ScannerDevice | undefined {
    return this.scanners.get(scannerId);
}

/**
 * Get all scanners
 */
getAllScanners(): ScannerDevice[] {
    return Array.from(this.scanners.values());
}

/**
 * Assign scanner to station and cashier
 */
assignScanner(
    scannerId: string,
    stationId: string,
    cashierId ?: string
): boolean {
    const scanner = this.scanners.get(scannerId);
    if (!scanner) return false;

    scanner.assignedStationId = stationId;
    scanner.assignedCashierId = cashierId;
    return true;
}

/**
 * Get scanner health status
 */
getScannerHealth(): { scannerId: string; status: 'healthy' | 'warning' | 'error'; lastSeen: number } [] {
    const now = Date.now();
    return Array.from(this.scanners.values()).map(scanner => {
        const timeSinceLastSeen = now - scanner.lastSeen;
        let status: 'healthy' | 'warning' | 'error' = 'healthy';

        if (timeSinceLastSeen > 5 * 60 * 1000) { // 5 minutes
            status = 'error';
        } else if (timeSinceLastSeen > 60 * 1000) { // 1 minute
            status = 'warning';
        }

        return {
            scannerId: scanner.id,
            status,
            lastSeen: scanner.lastSeen
        };
    });
}

    /**
     * Failover to backup scanner
     */
    async failoverToBackup(primaryScannerId: string, backupScannerId: string): Promise < boolean > {
    const primary = this.scanners.get(primaryScannerId);
    const backup = this.scanners.get(backupScannerId);

    if(!primary || !backup) return false;

console.warn(`🚨 FAILOVER: Disabling ${primaryScannerId}, Activating ${backupScannerId}`);

primary.isActive = false;
backup.isActive = true;
backup.assignedStationId = primary.assignedStationId;
backup.assignedCashierId = primary.assignedCashierId;

// Visual alert for cashier
await this.eventEngine.createEvent(
    EventType.ALERT_TRIGGERED,
    'system',
    {
        severity: 'medium',
        title: 'Scanner Failover',
        message: `Primary scanner ${primary.name} failed. Backup ${backup.name} now active.`,
        timestamp: Date.now()
    }
);

return true;
    }

/**
 * Cleanup expired scan sessions
 */
cleanupExpiredSessions(): void {
    const now = Date.now();
    for(const [sessionId, session] of this.activeScans) {
    if (now - session.startTime > this.SCAN_TIMEOUT) {
        clearTimeout(session.timeout);
        this.activeScans.delete(sessionId);
    }
}
    }
}

// Helper interfaces
interface ProductData {
    id: string;
    name: string;
    price: number;
    weight?: number;
}

interface ScanSession {
    id: string;
    transactionId: string;
    scannerId: string;
    barcode: string;
    startTime: number;
    timeout: NodeJS.Timeout;
}

interface TransactionRecoveryState {
    transactionId: string;
    scannedItems: any[]; // ScannedItem[]
    totalExpectedWeight: number;
    isLocked: boolean;
    bagVerified: boolean;
    lastActivity: number;
}