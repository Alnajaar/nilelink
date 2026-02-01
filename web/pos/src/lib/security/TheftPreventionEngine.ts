/**
 * NileLink Theft Prevention Engine
 *
 * Core security engine that prevents unpaid item theft through:
 * - Scanned item tracking with paid/unpaid status
 * - Transaction locking until verification complete
 * - Weight verification for bagging area
 * - Duplicate scan prevention
 * - Real-time alerts for security violations
 */

import { EventEngine } from '../events/EventEngine';
import { LocalLedger } from '../storage/LocalLedger';
import {
    EventType,
    ItemScannedEvent,
    ItemBaggedEvent,
    BagWeightVerifiedEvent,
    TransactionLockedEvent,
    ScanDuplicateDetectedEvent,
    AlertTriggeredEvent
} from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export interface ScannedItem {
    id: string;
    transactionId: string;
    productId: string;
    productName: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    weight?: number;
    scannerId: string;
    cashierId: string;
    status: 'scanned' | 'verified' | 'bagged' | 'paid';
    scannedAt: number;
    verifiedAt?: number;
    baggedAt?: number;
    paidAt?: number;
}

export interface TransactionSecurityState {
    transactionId: string;
    scannedItems: Map<string, ScannedItem>; // productId -> ScannedItem
    totalExpectedWeight: number;
    totalActualWeight?: number;
    weightTolerance: number;
    isLocked: boolean;
    lockReason?: string;
    lockTimestamp?: number;
    bagVerified: boolean;
    allItemsPaid: boolean;
    lastActivity: number;
}

export class TheftPreventionEngine {
    private eventEngine: EventEngine;
    private ledger: LocalLedger;
    private transactionStates = new Map<string, TransactionSecurityState>();
    private scannedItemsCache = new Map<string, ScannedItem>();

    // Configuration
    private readonly DEFAULT_WEIGHT_TOLERANCE = 0.05; // 5% tolerance
    private readonly TRANSACTION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    constructor(eventEngine: EventEngine, ledger: LocalLedger) {
        this.eventEngine = eventEngine;
        this.ledger = ledger;
        this.initializeFromEvents();
    }

    /**
     * Initialize state from existing events
     */
    private async initializeFromEvents(): Promise<void> {
        try {
            const events = await this.ledger.getAllEvents();

            // Replay events to rebuild state
            for (const event of events) {
                await this.processEvent(event);
            }

            console.log('✅ Theft Prevention Engine initialized from events');
        } catch (error) {
            console.error('❌ Failed to initialize Theft Prevention Engine:', error);
        }
    }

    /**
     * Process incoming events to update security state
     */
    private async processEvent(event: any): Promise<void> {
        switch (event.type) {
            case EventType.ORDER_CREATED:
                this.createTransactionState(event.payload.orderId);
                break;

            case EventType.ITEM_SCANNED:
                this.updateScannedItem(event.payload);
                break;

            case EventType.ITEM_BAGGED:
                this.updateBaggedItem(event.payload);
                break;

            case EventType.BAG_WEIGHT_VERIFIED:
                this.updateWeightVerification(event.payload);
                break;

            case EventType.TRANSACTION_LOCKED:
                this.updateTransactionLock(event.payload);
                break;

            case EventType.PAYMENT_COLLECTED_CASH:
            case EventType.PAYMENT_COLLECTED_CARD:
            case EventType.PAYMENT_COLLECTED_DIGITAL:
                this.markTransactionPaid(event.payload.orderId);
                break;

            case EventType.ORDER_CANCELLED:
                this.cancelTransaction(event.payload.orderId);
                break;
        }
    }

    /**
     * Create new transaction security state
     */
    private createTransactionState(transactionId: string): void {
        const state: TransactionSecurityState = {
            transactionId,
            scannedItems: new Map(),
            totalExpectedWeight: 0,
            weightTolerance: this.DEFAULT_WEIGHT_TOLERANCE,
            isLocked: false,
            bagVerified: false,
            allItemsPaid: false,
            lastActivity: Date.now(),
        };

        this.transactionStates.set(transactionId, state);
    }

    /**
     * Cancel transaction and clean up state
     */
    private cancelTransaction(transactionId: string): void {
        this.transactionStates.delete(transactionId);

        // Clean up scanned items cache
        for (const [key, item] of this.scannedItemsCache) {
            if (item.transactionId === transactionId) {
                this.scannedItemsCache.delete(key);
            }
        }
    }

    /**
     * Mark transaction as paid and update item statuses
     */
    private markTransactionPaid(transactionId: string): void {
        const state = this.transactionStates.get(transactionId);
        if (!state) return;

        state.allItemsPaid = true;

        // Update all scanned items to paid status
        for (const item of state.scannedItems.values()) {
            item.status = 'paid';
            item.paidAt = Date.now();
        }
    }

    /**
     * Record scanned item and check for duplicates
     */
    async recordScannedItem(
        transactionId: string,
        productId: string,
        productName: string,
        barcode: string,
        quantity: number,
        unitPrice: number,
        weight: number | undefined,
        scannerId: string,
        cashierId: string
    ): Promise<{ allowed: boolean; duplicate?: boolean }> {
        const state = this.transactionStates.get(transactionId);
        if (!state) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        // Check for duplicates within this transaction
        const existingItem = state.scannedItems.get(productId);
        if (existingItem) {
            // Create duplicate detection event
            await this.eventEngine.createEvent<ScanDuplicateDetectedEvent>(
                EventType.SCAN_DUPLICATE_DETECTED,
                cashierId,
                {
                    transactionId,
                    productId,
                    duplicateTimestamp: Date.now(),
                    scannerId,
                    cashierId,
                    action: 'blocked',
                }
            );

            return { allowed: false, duplicate: true };
        }

        // Create scanned item record
        const scannedItem: ScannedItem = {
            id: uuidv4(),
            transactionId,
            productId,
            productName,
            barcode,
            quantity,
            unitPrice,
            weight,
            scannerId,
            cashierId,
            status: 'scanned',
            scannedAt: Date.now(),
        };

        state.scannedItems.set(productId, scannedItem);
        state.totalExpectedWeight += (weight || 0) * quantity;
        state.lastActivity = Date.now();

        // Cache for quick access
        this.scannedItemsCache.set(scannedItem.id, scannedItem);

        // Create event
        await this.eventEngine.createEvent<ItemScannedEvent>(
            EventType.ITEM_SCANNED,
            cashierId,
            {
                transactionId,
                productId,
                productName,
                barcode,
                quantity,
                unitPrice,
                weight,
                scannerId,
                cashierId,
                status: 'scanned',
            }
        );

        return { allowed: true };
    }

    /**
     * Update scanned item status
     */
    private updateScannedItem(payload: any): void {
        const { transactionId, productId, status } = payload;
        const state = this.transactionStates.get(transactionId);
        if (!state) return;

        const item = state.scannedItems.get(productId);
        if (item) {
            item.status = status;
            if (status === 'verified') item.verifiedAt = Date.now();
            if (status === 'bagged') item.baggedAt = Date.now();
            if (status === 'paid') item.paidAt = Date.now();
        }
    }

    /**
     * Record bagged item
     */
    async recordBaggedItem(
        transactionId: string,
        productId: string,
        baggingScaleId?: string,
        expectedWeight?: number,
        actualWeight?: number
    ): Promise<void> {
        const state = this.transactionStates.get(transactionId);
        if (!state) return;

        const item = state.scannedItems.get(productId);
        if (!item) return;

        item.status = 'bagged';
        item.baggedAt = Date.now();

        // Create bagging event
        await this.eventEngine.createEvent<ItemBaggedEvent>(
            EventType.ITEM_BAGGED,
            item.cashierId,
            {
                transactionId,
                productId,
                baggingScaleId,
                expectedWeight,
                actualWeight,
                weightVariance: expectedWeight && actualWeight ? actualWeight - expectedWeight : undefined,
                verified: true,
            }
        );
    }

    /**
     * Verify bag weight
     */
    async verifyBagWeight(
        transactionId: string,
        totalActualWeight: number,
        baggingScaleId: string,
        cashierId: string
    ): Promise<{ verified: boolean; variance: number }> {
        const state = this.transactionStates.get(transactionId);
        if (!state) {
            throw new Error(`Transaction ${transactionId} not found`);
        }

        const variance = Math.abs(totalActualWeight - state.totalExpectedWeight);
        const tolerance = state.totalExpectedWeight * state.weightTolerance;
        const verified = variance <= tolerance;

        state.totalActualWeight = totalActualWeight;
        state.bagVerified = verified;

        // Create weight verification event
        await this.eventEngine.createEvent<BagWeightVerifiedEvent>(
            EventType.BAG_WEIGHT_VERIFIED,
            cashierId,
            {
                transactionId,
                totalExpectedWeight: state.totalExpectedWeight,
                totalActualWeight,
                variance,
                tolerance,
                verified,
                baggingScaleId,
            }
        );

        // Alert if weight mismatch
        if (!verified) {
            await this.createSecurityAlert(
                'theft',
                'high',
                'Weight Mismatch Detected',
                `Bag weight variance of ${variance.toFixed(2)}g exceeds tolerance`,
                { transactionId, variance, tolerance },
                cashierId
            );
        }

        return { verified, variance };
    }

    /**
     * Check if transaction can proceed to payment
     */
    canProceedToPayment(transactionId: string): { allowed: boolean; reasons: string[] } {
        const state = this.transactionStates.get(transactionId);
        if (!state) {
            return { allowed: false, reasons: ['Transaction not found'] };
        }

        const reasons: string[] = [];

        // Check if all scanned items are accounted for
        const scannedCount = state.scannedItems.size;
        if (scannedCount === 0) {
            reasons.push('No items scanned');
        }

        // Check if transaction is locked
        if (state.isLocked) {
            reasons.push(`Transaction locked: ${state.lockReason}`);
        }

        // Check weight verification
        if (!state.bagVerified && state.totalExpectedWeight > 0) {
            reasons.push('Bag weight not verified');
        }

        // Check for unbagged items
        const unbaggedItems = Array.from(state.scannedItems.values())
            .filter(item => item.status !== 'bagged' && item.status !== 'paid');

        if (unbaggedItems.length > 0) {
            reasons.push(`${unbaggedItems.length} items not bagged`);
        }

        return {
            allowed: reasons.length === 0,
            reasons
        };
    }

    /**
     * Lock transaction for security reasons
     */
    async lockTransaction(
        transactionId: string,
        reason: string,
        actorId: string
    ): Promise<void> {
        const state = this.transactionStates.get(transactionId);
        if (!state) return;

        state.isLocked = true;
        state.lockReason = reason;
        state.lockTimestamp = Date.now();

        await this.eventEngine.createEvent<TransactionLockedEvent>(
            EventType.TRANSACTION_LOCKED,
            actorId,
            {
                transactionId,
                reason: reason as any,
                lockedBy: actorId,
                lockTimestamp: state.lockTimestamp,
            }
        );

        // Create security alert
        await this.createSecurityAlert(
            'security',
            'high',
            'Transaction Locked',
            `Transaction ${transactionId} locked for: ${reason}`,
            { transactionId, reason },
            actorId
        );
    }

    /**
     * Unlock transaction
     */
    async unlockTransaction(
        transactionId: string,
        actorId: string
    ): Promise<void> {
        const state = this.transactionStates.get(transactionId);
        if (!state || !state.isLocked) return;

        state.isLocked = false;
        state.lockReason = undefined;
        state.lockTimestamp = undefined;

        await this.eventEngine.createEvent<TransactionLockedEvent>(
            EventType.TRANSACTION_LOCKED,
            actorId,
            {
                transactionId,
                reason: 'unpaid_items', // dummy value for unlock
                lockedBy: state.lockTimestamp?.toString() || '',
                lockTimestamp: state.lockTimestamp || 0,
                unlockedBy: actorId,
                unlockTimestamp: Date.now(),
            }
        );
    }

    /**
     * Create security alert
     */
    private async createSecurityAlert(
        category: 'security' | 'theft' | 'system' | 'operational',
        severity: 'low' | 'medium' | 'high' | 'critical',
        title: string,
        message: string,
        context: Record<string, any>,
        actorId: string
    ): Promise<void> {
        await this.eventEngine.createEvent<AlertTriggeredEvent>(
            EventType.ALERT_TRIGGERED,
            actorId,
            {
                alertId: uuidv4(),
                severity,
                category,
                title,
                message,
                context,
                source: 'TheftPreventionEngine',
                acknowledged: false,
            }
        );
    }

    /**
     * Get transaction security state
     */
    getTransactionState(transactionId: string): TransactionSecurityState | undefined {
        return this.transactionStates.get(transactionId);
    }

    /**
     * Get all active transaction states
     */
    getAllTransactionStates(): TransactionSecurityState[] {
        return Array.from(this.transactionStates.values());
    }

    /**
     * Clean up expired transactions
     */
    cleanupExpiredTransactions(): void {
        const now = Date.now();
        const expiredTransactions: string[] = [];

        for (const [transactionId, state] of this.transactionStates) {
            if (now - state.lastActivity > this.TRANSACTION_TIMEOUT) {
                expiredTransactions.push(transactionId);
            }
        }

        for (const transactionId of expiredTransactions) {
            this.cancelTransaction(transactionId);
        }
    }

    /**
     * Get unpaid item summary for transaction
     */
    getUnpaidItemsSummary(transactionId: string): {
        totalItems: number;
        paidItems: number;
        unbaggedItems: number;
        unverifiedItems: number;
    } {
        const state = this.transactionStates.get(transactionId);
        if (!state) {
            return { totalItems: 0, paidItems: 0, unbaggedItems: 0, unverifiedItems: 0 };
        }

        const items = Array.from(state.scannedItems.values());
        const totalItems = items.length;
        const paidItems = items.filter(item => item.status === 'paid').length;
        const unbaggedItems = items.filter(item => item.status !== 'bagged' && item.status !== 'paid').length;
        const unverifiedItems = items.filter(item => item.status === 'scanned').length;

        return { totalItems, paidItems, unbaggedItems, unverifiedItems };
    }
}