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
    | StaffShiftEndedEvent;

// ============= Event Metadata =============

export interface EventMetadata {
    eventCount: number;
    firstEventTimestamp: number;
    lastEventTimestamp: number;
    deviceCount: number;
    branchCount: number;
    syncStatus: 'synced' | 'pending' | 'failed';
}
