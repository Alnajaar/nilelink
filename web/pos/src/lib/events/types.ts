/**
 * NileLink Event Engine - Core Event Types
 * 
 * Every economic action in the NileLink ecosystem is represented as an immutable event.
 * Events form a cryptographically-linked chain and serve as the single source of truth.
 */

export enum EventType {
    // Order Events
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_ITEM_ADDED = 'ORDER_ITEM_ADDED',
    ORDER_ITEM_REMOVED = 'ORDER_ITEM_REMOVED',
    ORDER_MODIFIED = 'ORDER_MODIFIED',
    ORDER_SUBMITTED = 'ORDER_SUBMITTED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',

    // Kitchen Events
    ITEM_PREPARATION_STARTED = 'ITEM_PREPARATION_STARTED',
    ITEM_PREPARATION_COMPLETED = 'ITEM_PREPARATION_COMPLETED',
    ORDER_READY = 'ORDER_READY',
    ORDER_SERVED = 'ORDER_SERVED',

    // Payment Events
    PAYMENT_INITIATED = 'PAYMENT_INITIATED',
    PAYMENT_COLLECTED_CASH = 'PAYMENT_COLLECTED_CASH',
    PAYMENT_COLLECTED_CARD = 'PAYMENT_COLLECTED_CARD',
    PAYMENT_COLLECTED_DIGITAL = 'PAYMENT_COLLECTED_DIGITAL',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',

    // Inventory Events
    INVENTORY_DEDUCTED = 'INVENTORY_DEDUCTED',
    INVENTORY_ADDED = 'INVENTORY_ADDED',
    INVENTORY_ADJUSTED = 'INVENTORY_ADJUSTED',
    INVENTORY_COUNTED = 'INVENTORY_COUNTED',
    INVENTORY_WASTE_LOGGED = 'INVENTORY_WASTE_LOGGED',
    INVENTORY_TRANSFERRED = 'INVENTORY_TRANSFERRED',

    // Cash Events
    CASH_DRAWER_OPENED = 'CASH_DRAWER_OPENED',
    CASH_DRAWER_CLOSED = 'CASH_DRAWER_CLOSED',
    CASH_SALE_COLLECTED = 'CASH_SALE_COLLECTED',
    CASH_DELIVERY_COLLECTED = 'CASH_DELIVERY_COLLECTED',
    CASH_HANDOVER = 'CASH_HANDOVER',
    CASH_BANK_DEPOSIT = 'CASH_BANK_DEPOSIT',
    CASH_RECONCILIATION = 'CASH_RECONCILIATION',

    // Staff Events
    STAFF_SHIFT_STARTED = 'STAFF_SHIFT_STARTED',
    STAFF_SHIFT_ENDED = 'STAFF_SHIFT_ENDED',
    STAFF_BREAK_STARTED = 'STAFF_BREAK_STARTED',
    STAFF_BREAK_ENDED = 'STAFF_BREAK_ENDED',
    STAFF_ACTION_LOGGED = 'STAFF_ACTION_LOGGED',

    // Delivery Events
    DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
    DELIVERY_PICKED_UP = 'DELIVERY_PICKED_UP',
    DELIVERY_IN_TRANSIT = 'DELIVERY_IN_TRANSIT',
    DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
    DELIVERY_FAILED = 'DELIVERY_FAILED',

    // Supplier Events
    SUPPLIER_ORDER_CREATED = 'SUPPLIER_ORDER_CREATED',
    SUPPLIER_ORDER_RECEIVED = 'SUPPLIER_ORDER_RECEIVED',
    SUPPLIER_ORDER_VERIFIED = 'SUPPLIER_ORDER_VERIFIED',
    SUPPLIER_PAYMENT_MADE = 'SUPPLIER_PAYMENT_MADE',

    // Security & Theft Prevention Events
    ITEM_SCANNED = 'ITEM_SCANNED',
    ITEM_SCAN_VERIFIED = 'ITEM_SCAN_VERIFIED',
    ITEM_BAGGED = 'ITEM_BAGGED',
    BAG_WEIGHT_VERIFIED = 'BAG_WEIGHT_VERIFIED',
    TRANSACTION_LOCKED = 'TRANSACTION_LOCKED',
    TRANSACTION_UNLOCKED = 'TRANSACTION_UNLOCKED',
    CASHIER_SESSION_STARTED = 'CASHIER_SESSION_STARTED',
    CASHIER_SESSION_ENDED = 'CASHIER_SESSION_ENDED',
    SCAN_DUPLICATE_DETECTED = 'SCAN_DUPLICATE_DETECTED',
    ALERT_TRIGGERED = 'ALERT_TRIGGERED',
    ALERT_ACKNOWLEDGED = 'ALERT_ACKNOWLEDGED',
    FRAUD_ANOMALY_DETECTED = 'FRAUD_ANOMALY_DETECTED',
    INVENTORY_LOCK_INTENT = 'INVENTORY_LOCK_INTENT',
    INVENTORY_LOCK_REJECTED = 'INVENTORY_LOCK_REJECTED',
    EAS_TAG_UNLOCKED = 'EAS_TAG_UNLOCKED',
    EAS_GATE_TRIGGERED = 'EAS_GATE_TRIGGERED',
    CAMERA_EVENT_RECORDED = 'CAMERA_EVENT_RECORDED',
    CAMERA_CONNECTED = 'CAMERA_CONNECTED',
    CAMERA_DISCONNECTED = 'CAMERA_DISCONNECTED',
    CAMERA_TAMPER_DETECTED = 'CAMERA_TAMPER_DETECTED',

    // Print Events
    PRINT_JOB_QUEUED = 'PRINT_JOB_QUEUED',
    PRINTER_JOB_STARTED = 'PRINTER_JOB_STARTED',
    PRINTER_JOB_COMPLETED = 'PRINTER_JOB_COMPLETED',
    PRINTER_ERROR = 'PRINTER_ERROR',
    PRINTER_STATUS_CHANGED = 'PRINTER_STATUS_CHANGED',

    // System Events
    BRANCH_OPENED = 'BRANCH_OPENED',
    BRANCH_CLOSED = 'BRANCH_CLOSED',
    SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
    DATA_SYNC_STARTED = 'DATA_SYNC_STARTED',
    DATA_SYNC_COMPLETED = 'DATA_SYNC_COMPLETED',
}

export interface BaseEvent {
    id: string;                    // Unique event ID (UUID)
    type: EventType;               // Event classifier
    timestamp: number;             // Unix timestamp (milliseconds)
    deviceId: string;              // Terminal/tablet identifier
    actorId: string;               // Staff member who triggered
    branchId: string;              // Edge node location
    hash: string;                  // SHA-256 for integrity
    previousHash: string | null;  // Chain link (null for genesis)
    offline: boolean;              // Was created offline?
    syncedAt?: number;             // When uploaded to cloud
    version: number;               // Event schema version (for upgrades)
}

// ============= Order Events =============

export interface OrderCreatedEvent extends BaseEvent {
    type: EventType.ORDER_CREATED;
    payload: {
        orderId: string;
        orderType: 'dine-in' | 'takeout' | 'delivery';
        tableNumber?: string;
        customerId?: string;
    };
}

export interface OrderItemAddedEvent extends BaseEvent {
    type: EventType.ORDER_ITEM_ADDED;
    payload: {
        orderId: string;
        menuItemId: string;
        menuItemName: string;
        quantity: number;
        unitPrice: number;
        modifiers?: Array<{
            name: string;
            price: number;
        }>;
        specialInstructions?: string;
    };
}

export interface OrderSubmittedEvent extends BaseEvent {
    type: EventType.ORDER_SUBMITTED;
    payload: {
        orderId: string;
        totalAmount: number;
        subtotal: number;
        taxAmount: number;
        discountAmount?: number;
        itemCount: number;
    };
}

// ============= Payment Events =============

export interface PaymentCollectedCashEvent extends BaseEvent {
    type: EventType.PAYMENT_COLLECTED_CASH;
    payload: {
        orderId: string;
        amount: number;
        currency: 'EGP' | 'USD';
        amountTendered: number;
        changeGiven: number;
        cashierId: string;
    };
}

export interface PaymentCollectedCardEvent extends BaseEvent {
    type: EventType.PAYMENT_COLLECTED_CARD;
    payload: {
        orderId: string;
        amount: number;
        currency: 'EGP' | 'USD';
        cardType: 'visa' | 'mastercard' | 'amex';
        last4Digits: string;
        transactionId: string;
        providerFee: number;
    };
}

export interface PaymentCollectedDigitalEvent extends BaseEvent {
    type: EventType.PAYMENT_COLLECTED_DIGITAL;
    payload: {
        orderId: string;
        amount: number;
        currency: 'EGP' | 'USD';
        method: 'wallet' | 'crypto' | 'bank_transfer';
        transactionId: string;
    };
}

// ============= Inventory Events =============

export interface InventoryDeductedEvent extends BaseEvent {
    type: EventType.INVENTORY_DEDUCTED;
    payload: {
        ingredientId: string;
        ingredientName: string;
        quantity: number;
        unit: 'kg' | 'L' | 'pcs' | 'g' | 'ml';
        reason: 'sale' | 'waste' | 'transfer' | 'adjustment';
        relatedOrderId?: string;
        relatedRecipeId?: string;
    };
}

export interface InventoryAddedEvent extends BaseEvent {
    type: EventType.INVENTORY_ADDED;
    payload: {
        ingredientId: string;
        ingredientName: string;
        quantity: number;
        unit: 'kg' | 'L' | 'pcs' | 'g' | 'ml';
        supplierId?: string;
        costPerUnit: number;
    };
}

export interface InventoryWasteLoggedEvent extends BaseEvent {
    type: EventType.INVENTORY_WASTE_LOGGED;
    payload: {
        ingredientId: string;
        ingredientName: string;
        quantity: number;
        unit: 'kg' | 'L' | 'pcs' | 'g' | 'ml';
        reason: 'spoiled' | 'damaged' | 'expired' | 'preparation-error';
        estimatedCost: number;
        responsibleStaffId: string;
    };
}

// ============= Cash Events =============

export interface CashHandoverEvent extends BaseEvent {
    type: EventType.CASH_HANDOVER;
    payload: {
        amount: number;
        currency: 'EGP' | 'USD';
        fromStaffId: string;
        toStaffId: string;
        reason: 'shift-change' | 'bank-deposit' | 'manager-collection';
        expectedAmount: number;
        actualAmount: number;
        variance: number;
    };
}

export interface CashReconciliationEvent extends BaseEvent {
    type: EventType.CASH_RECONCILIATION;
    payload: {
        shiftId: string;
        staffId: string;
        expectedBalance: number;
        actualBalance: number;
        variance: number;
        denominationBreakdown: Array<{
            denomination: number;
            count: number;
            total: number;
        }>;
        notes?: string;
    };
}

export interface CashBankDepositEvent extends BaseEvent {
    type: EventType.CASH_BANK_DEPOSIT;
    payload: {
        staffId: string;
        amount: number;
        currency: 'EGP' | 'USD';
        bankName: string;
        receiptNumber: string;
        timestamp: number;
    };
}

export interface CashDrawerOpenedEvent extends BaseEvent {
    type: EventType.CASH_DRAWER_OPENED;
    payload: {
        staffId: string;
        openingBalance: number;
        currency: 'EGP' | 'USD';
        timestamp: number;
    };
}

export interface CashDrawerClosedEvent extends BaseEvent {
    type: EventType.CASH_DRAWER_CLOSED;
    payload: {
        staffId: string;
        closingBalance: number;
        currency: 'EGP' | 'USD';
        timestamp: number;
    };
}

// ============= Staff Events =============

export interface StaffShiftStartedEvent extends BaseEvent {
    type: EventType.STAFF_SHIFT_STARTED;
    payload: {
        shiftId: string;
        staffId: string;
        staffName: string;
        role: 'cashier' | 'chef' | 'waiter' | 'manager';
        startTime: number;
        openingCashBalance?: number;
    };
}

export interface StaffShiftEndedEvent extends BaseEvent {
    type: EventType.STAFF_SHIFT_ENDED;
    payload: {
        shiftId: string;
        staffId: string;
        endTime: number;
        duration: number;  // milliseconds
        ordersProcessed: number;
        cashHandled: number;
        closingCashBalance?: number;
    };
}

// ============= Security & Theft Prevention Events =============

export interface ItemScannedEvent extends BaseEvent {
    type: EventType.ITEM_SCANNED;
    payload: {
        transactionId: string;
        productId: string;
        productName: string;
        barcode: string;
        quantity: number;
        unitPrice: number;
        weight?: number;  // For weight-based items
        scannerId: string;
        cashierId: string;
        status: 'scanned' | 'verified' | 'bagged' | 'paid';
    };
}

export interface ItemBaggedEvent extends BaseEvent {
    type: EventType.ITEM_BAGGED;
    payload: {
        transactionId: string;
        productId: string;
        baggingScaleId?: string;
        expectedWeight?: number;
        actualWeight?: number;
        weightVariance?: number;
        verified: boolean;
    };
}

export interface BagWeightVerifiedEvent extends BaseEvent {
    type: EventType.BAG_WEIGHT_VERIFIED;
    payload: {
        transactionId: string;
        totalExpectedWeight: number;
        totalActualWeight: number;
        variance: number;
        tolerance: number;
        verified: boolean;
        baggingScaleId: string;
    };
}

export interface TransactionLockedEvent extends BaseEvent {
    type: EventType.TRANSACTION_LOCKED;
    payload: {
        transactionId: string;
        reason: 'unpaid_items' | 'weight_mismatch' | 'security_check' | 'manual_hold';
        lockedBy: string;
        lockTimestamp: number;
        unlockedBy?: string;
        unlockTimestamp?: number;
    };
}

export interface CashierSessionStartedEvent extends BaseEvent {
    type: EventType.CASHIER_SESSION_STARTED;
    payload: {
        sessionId: string;
        cashierId: string;
        cashierName: string;
        stationId: string;
        startTime: number;
        permissions: string[];
        openingBalance?: number;
    };
}

export interface CashierSessionEndedEvent extends BaseEvent {
    type: EventType.CASHIER_SESSION_ENDED;
    payload: {
        sessionId: string;
        cashierId: string;
        endTime: number;
        duration: number;
        transactionsProcessed: number;
        totalRevenue: number;
        closingBalance?: number;
    };
}

export interface ScanDuplicateDetectedEvent extends BaseEvent {
    type: EventType.SCAN_DUPLICATE_DETECTED;
    payload: {
        transactionId: string;
        productId: string;
        duplicateTimestamp: number;
        scannerId: string;
        cashierId: string;
        action: 'blocked' | 'allowed' | 'flagged';
    };
}

export interface AlertTriggeredEvent extends BaseEvent {
    type: EventType.ALERT_TRIGGERED;
    payload: {
        alertId: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        category: 'security' | 'theft' | 'system' | 'operational';
        title: string;
        message: string;
        context: Record<string, any>;
        source: string;
        acknowledged: boolean;
        acknowledgedBy?: string;
        acknowledgedAt?: number;
    };
}

export interface AlertAcknowledgedEvent extends BaseEvent {
    type: EventType.ALERT_ACKNOWLEDGED;
    payload: {
        alertId: string;
        acknowledgedBy: string;
        timestamp: number;
        notes?: string;
    };
}

export interface EASEvent extends BaseEvent {
    type: EventType.EAS_GATE_TRIGGERED | EventType.EAS_TAG_UNLOCKED;
    payload: {
        transactionId?: string;
        tagId?: string;
        gateId: string;
        action: 'entry' | 'exit' | 'unlock' | 'lock' | 'alarm' | 'tamper';
        timestamp: number;
        authorized: boolean;
        items?: Array<{
            productId: string;
            quantity: number;
        }>;
    };
}

export interface CameraEventRecordedEvent extends BaseEvent {
    type: EventType.CAMERA_EVENT_RECORDED;
    payload: {
        cameraId: string;
        timestamp: number;
        eventType: 'motion' | 'person_detected' | 'item_pickup' | 'checkout_activity';
        transactionId?: string;
        location: {
            x: number;
            y: number;
            zone: string;
        };
        confidence: number;
        metadata: Record<string, any>;
    };
}

export interface FraudAnomalyDetectedEvent extends BaseEvent {
    type: EventType.FRAUD_ANOMALY_DETECTED;
    payload: {
        anomalyId: string;
        cashierId: string;
        sessionId: string;
        anomalyType: 'EXCESSIVE_VOID' | 'EXCESSIVE_REFUND' | 'HIGH_DISCOUNT_FREQUENCY' | 'SUSPICIOUS_TIMING' | 'LIMIT_BREACH';
        severity: number;
        transactionId?: string;
        amount?: number;
        threshold?: number;
        details: string;
    };
}

export interface InventoryLockIntentEvent extends BaseEvent {
    type: EventType.INVENTORY_LOCK_INTENT;
    payload: {
        intentId: string;
        productId: string;
        quantity: number;
        sessionId: string;
        timestamp: number;
    };
}

export interface InventoryLockRejectedEvent extends BaseEvent {
    type: EventType.INVENTORY_LOCK_REJECTED;
    payload: {
        intentId: string;
        reason: string;
        availableStock: number;
        timestamp: number;
    };
}

export interface CameraLifecycleEvent extends BaseEvent {
    type: EventType.CAMERA_CONNECTED | EventType.CAMERA_DISCONNECTED | EventType.CAMERA_TAMPER_DETECTED;
    payload: {
        cameraId: string;
        location: string;
        status: string;
        timestamp: number;
        reason?: string;
    };
}

// ============= Union Type for All Events =============

export type EconomicEvent =
    | OrderCreatedEvent
    | OrderItemAddedEvent
    | OrderSubmittedEvent
    | PaymentCollectedCashEvent
    | PaymentCollectedCardEvent
    | PaymentCollectedDigitalEvent
    | InventoryDeductedEvent
    | InventoryAddedEvent
    | InventoryWasteLoggedEvent
    | CashHandoverEvent
    | CashBankDepositEvent
    | CashReconciliationEvent
    | CashDrawerOpenedEvent
    | CashDrawerClosedEvent
    | StaffShiftStartedEvent
    | StaffShiftEndedEvent
    | ItemScannedEvent
    | ItemBaggedEvent
    | BagWeightVerifiedEvent
    | TransactionLockedEvent
    | CashierSessionStartedEvent
    | CashierSessionEndedEvent
    | ScanDuplicateDetectedEvent
    | AlertTriggeredEvent
    | AlertAcknowledgedEvent
    | FraudAnomalyDetectedEvent
    | InventoryLockIntentEvent
    | InventoryLockRejectedEvent
    | InventoryLockRejectedEvent
    | PrinterStatusEvent
    | PrinterJobEvent
    | CameraLifecycleEvent
    | EASEvent
    | CameraEventRecordedEvent;

// ============= Event Metadata =============

export interface EventMetadata {
    eventCount: number;
    firstEventTimestamp: number;
    lastEventTimestamp: number;
    deviceCount: number;
    branchCount: number;
    syncStatus: 'synced' | 'pending' | 'failed';
}
