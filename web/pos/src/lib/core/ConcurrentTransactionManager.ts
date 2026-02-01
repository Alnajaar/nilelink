/**
 * Concurrent Transaction Manager - Enables Safe Parallel Processing for Supermarkets
 * 
 * Manages multiple simultaneous transactions without conflicts or race conditions
 * Ensures inventory consistency and prevents double-selling
 */

import { EventEmitter } from 'events';

export interface ConcurrentTransaction {
    id: string;
    sessionId: string;
    cashierId: string;
    items: TransactionItem[];
    status: 'active' | 'completed' | 'cancelled';
    createdAt: number;
    updatedAt: number;
}

export interface TransactionItem {
    productId: string;
    quantity: number;
    reservedQuantity: number; // Quantity reserved for this transaction
    unitPrice: number;
    metadata: any;
}

export interface InventoryReservation {
    productId: string;
    reservedBy: string; // transaction ID
    quantity: number;
    timestamp: number;
    expiresAt: number;
}

export class ConcurrentTransactionManager extends EventEmitter {
    private transactions: Map<string, ConcurrentTransaction> = new Map();
    private reservations: Map<string, InventoryReservation[]> = new Map();
    private readonly RESERVATION_TIMEOUT = 300000; // 5 minutes

    constructor() {
        super();
        this.startCleanupInterval();
    }

    /**
     * Start new transaction session
     */
    startTransaction(sessionId: string, cashierId: string): string {
        const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const transaction: ConcurrentTransaction = {
            id: transactionId,
            sessionId,
            cashierId,
            items: [],
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.transactions.set(transactionId, transaction);
        this.emit('transaction.started', { transactionId, sessionId, cashierId });
        
        console.log(`🏪 Started transaction ${transactionId} for cashier ${cashierId}`);
        return transactionId;
    }

    /**
     * Add item to transaction with inventory reservation
     */
    async addItemToTransaction(
        transactionId: string,
        productId: string,
        quantity: number,
        unitPrice: number,
        inventoryCheck: (productId: string, requestedQty: number) => Promise<{ available: boolean; currentStock: number }>
    ): Promise<{ success: boolean; message?: string }> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction || transaction.status !== 'active') {
            return { success: false, message: 'Invalid or inactive transaction' };
        }

        // Check if item already exists in transaction
        const existingItem = transaction.items.find(item => item.productId === productId);
        
        const totalRequestedQuantity = existingItem 
            ? existingItem.quantity + quantity 
            : quantity;

        // Check inventory availability
        const inventoryResult = await inventoryCheck(productId, totalRequestedQuantity);
        if (!inventoryResult.available) {
            return {
                success: false,
                message: `Insufficient stock. Available: ${inventoryResult.currentStock}`
            };
        }

        // Reserve inventory
        const reservationSuccess = await this.reserveInventory(productId, transactionId, quantity);
        if (!reservationSuccess) {
            return {
                success: false,
                message: 'Failed to reserve inventory'
            };
        }

        try {
            if (existingItem) {
                // Update existing item
                existingItem.quantity += quantity;
                existingItem.reservedQuantity += quantity;
            } else {
                // Add new item
                const newItem: TransactionItem = {
                    productId,
                    quantity,
                    reservedQuantity: quantity,
                    unitPrice,
                    metadata: {}
                };
                transaction.items.push(newItem);
            }

            transaction.updatedAt = Date.now();
            this.transactions.set(transactionId, transaction);
            
            this.emit('transaction.item.added', {
                transactionId,
                productId,
                quantity,
                totalQuantity: existingItem ? existingItem.quantity + quantity : quantity
            });

            return { success: true };
        } catch (error) {
            // Rollback reservation on error
            await this.releaseInventory(productId, transactionId, quantity);
            return { success: false, message: 'Failed to add item to transaction' };
        }
    }

    /**
     * Remove item from transaction and release reservation
     */
    async removeItemFromTransaction(
        transactionId: string,
        productId: string
    ): Promise<boolean> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return false;

        const itemIndex = transaction.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) return false;

        const item = transaction.items[itemIndex];
        
        // Release the reservation
        await this.releaseInventory(productId, transactionId, item.reservedQuantity);

        // Remove item from transaction
        transaction.items.splice(itemIndex, 1);
        transaction.updatedAt = Date.now();
        this.transactions.set(transactionId, transaction);

        this.emit('transaction.item.removed', {
            transactionId,
            productId,
            quantity: item.quantity
        });

        return true;
    }

    /**
     * Update item quantity in transaction
     */
    async updateItemQuantity(
        transactionId: string,
        productId: string,
        newQuantity: number,
        inventoryCheck: (productId: string, requestedQty: number) => Promise<{ available: boolean; currentStock: number }>
    ): Promise<{ success: boolean; message?: string }> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) {
            return { success: false, message: 'Transaction not found' };
        }

        const item = transaction.items.find(i => i.productId === productId);
        if (!item) {
            return { success: false, message: 'Item not found in transaction' };
        }

        const quantityDelta = newQuantity - item.quantity;

        if (quantityDelta > 0) {
            // Increasing quantity - check inventory and reserve more
            const inventoryResult = await inventoryCheck(productId, newQuantity);
            if (!inventoryResult.available) {
                return {
                    success: false,
                    message: `Insufficient stock for increase. Available: ${inventoryResult.currentStock}`
                };
            }

            const reservationSuccess = await this.reserveInventory(productId, transactionId, quantityDelta);
            if (!reservationSuccess) {
                return { success: false, message: 'Failed to reserve additional inventory' };
            }
        } else if (quantityDelta < 0) {
            // Decreasing quantity - release excess reservation
            await this.releaseInventory(productId, transactionId, Math.abs(quantityDelta));
        }

        item.quantity = newQuantity;
        item.reservedQuantity = newQuantity;
        transaction.updatedAt = Date.now();
        this.transactions.set(transactionId, transaction);

        this.emit('transaction.item.updated', {
            transactionId,
            productId,
            oldQuantity: item.quantity - quantityDelta,
            newQuantity
        });

        return { success: true };
    }

    /**
     * Complete transaction and finalize inventory changes
     */
    async completeTransaction(
        transactionId: string,
        finalizeInventory: (changes: { productId: string; quantityChange: number }[]) => Promise<boolean>
    ): Promise<{ success: boolean; message?: string }> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction || transaction.status !== 'active') {
            return { success: false, message: 'Invalid transaction' };
        }

        // Prepare inventory changes
        const inventoryChanges = transaction.items.map(item => ({
            productId: item.productId,
            quantityChange: -item.quantity // Negative because we're reducing stock
        }));

        try {
            // Finalize inventory changes
            const success = await finalizeInventory(inventoryChanges);
            if (!success) {
                return { success: false, message: 'Failed to update inventory' };
            }

            // Mark transaction as completed
            transaction.status = 'completed';
            transaction.updatedAt = Date.now();
            this.transactions.set(transactionId, transaction);

            // Clear reservations (they're now permanent)
            for (const item of transaction.items) {
                await this.clearReservationsForProduct(item.productId, transactionId);
            }

            this.emit('transaction.completed', {
                transactionId,
                itemCount: transaction.items.length,
                totalValue: transaction.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
            });

            console.log(`✅ Completed transaction ${transactionId} with ${transaction.items.length} items`);
            return { success: true };

        } catch (error) {
            console.error('Transaction completion failed:', error);
            return { success: false, message: 'Transaction completion failed' };
        }
    }

    /**
     * Cancel transaction and release all reservations
     */
    async cancelTransaction(transactionId: string): Promise<boolean> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return false;

        // Release all reservations
        for (const item of transaction.items) {
            await this.releaseInventory(item.productId, transactionId, item.reservedQuantity);
        }

        transaction.status = 'cancelled';
        transaction.updatedAt = Date.now();
        this.transactions.set(transactionId, transaction);

        this.emit('transaction.cancelled', { transactionId });
        
        console.log(`❌ Cancelled transaction ${transactionId}`);
        return true;
    }

    /**
     * Get active transactions for a cashier/session
     */
    getActiveTransactions(cashierId?: string, sessionId?: string): ConcurrentTransaction[] {
        const transactions = Array.from(this.transactions.values())
            .filter(tx => tx.status === 'active');

        if (cashierId) {
            return transactions.filter(tx => tx.cashierId === cashierId);
        }

        if (sessionId) {
            return transactions.filter(tx => tx.sessionId === sessionId);
        }

        return transactions;
    }

    /**
     * Get transaction by ID
     */
    getTransaction(transactionId: string): ConcurrentTransaction | null {
        return this.transactions.get(transactionId) || null;
    }

    /**
     * Reserve inventory for a transaction
     */
    private async reserveInventory(
        productId: string,
        transactionId: string,
        quantity: number
    ): Promise<boolean> {
        try {
            if (!this.reservations.has(productId)) {
                this.reservations.set(productId, []);
            }

            const reservations = this.reservations.get(productId)!;
            
            // Add new reservation
            const reservation: InventoryReservation = {
                productId,
                reservedBy: transactionId,
                quantity,
                timestamp: Date.now(),
                expiresAt: Date.now() + this.RESERVATION_TIMEOUT
            };

            reservations.push(reservation);
            this.reservations.set(productId, reservations);

            this.emit('inventory.reserved', {
                productId,
                transactionId,
                quantity,
                totalReserved: reservations.reduce((sum, r) => sum + r.quantity, 0)
            });

            return true;
        } catch (error) {
            console.error('Failed to reserve inventory:', error);
            return false;
        }
    }

    /**
     * Release inventory reservation
     */
    private async releaseInventory(
        productId: string,
        transactionId: string,
        quantity: number
    ): Promise<void> {
        const reservations = this.reservations.get(productId);
        if (!reservations) return;

        // Find and remove the specific reservation
        const reservationIndex = reservations.findIndex(
            r => r.reservedBy === transactionId
        );

        if (reservationIndex !== -1) {
            const reservation = reservations[reservationIndex];
            reservations.splice(reservationIndex, 1);
            
            if (reservations.length === 0) {
                this.reservations.delete(productId);
            } else {
                this.reservations.set(productId, reservations);
            }

            this.emit('inventory.released', {
                productId,
                transactionId,
                quantity: Math.min(quantity, reservation.quantity),
                remainingReserved: reservations.reduce((sum, r) => sum + r.quantity, 0)
            });
        }
    }

    /**
     * Clear all reservations for a specific transaction
     */
    private async clearReservationsForProduct(productId: string, transactionId: string): Promise<void> {
        const reservations = this.reservations.get(productId);
        if (!reservations) return;

        const filteredReservations = reservations.filter(r => r.reservedBy !== transactionId);
        
        if (filteredReservations.length === 0) {
            this.reservations.delete(productId);
        } else {
            this.reservations.set(productId, filteredReservations);
        }
    }

    /**
     * Get total reserved quantity for a product
     */
    getTotalReservedQuantity(productId: string): number {
        const reservations = this.reservations.get(productId);
        if (!reservations) return 0;
        
        return reservations.reduce((sum, reservation) => sum + reservation.quantity, 0);
    }

    /**
     * Cleanup expired reservations periodically
     */
    private startCleanupInterval(): void {
        setInterval(() => {
            const now = Date.now();
            let cleanedCount = 0;

            for (const [productId, reservations] of this.reservations.entries()) {
                const validReservations = reservations.filter(r => r.expiresAt > now);
                
                if (validReservations.length !== reservations.length) {
                    cleanedCount += reservations.length - validReservations.length;
                    if (validReservations.length === 0) {
                        this.reservations.delete(productId);
                    } else {
                        this.reservations.set(productId, validReservations);
                    }
                }
            }

            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned up ${cleanedCount} expired reservations`);
            }
        }, 60000); // Run every minute
    }

    /**
     * Get system statistics
     */
    getStats(): {
        activeTransactions: number;
        totalReservations: number;
        reservedProducts: number;
    } {
        const activeTransactions = Array.from(this.transactions.values())
            .filter(tx => tx.status === 'active').length;

        let totalReservations = 0;
        for (const reservations of this.reservations.values()) {
            totalReservations += reservations.length;
        }

        return {
            activeTransactions,
            totalReservations,
            reservedProducts: this.reservations.size
        };
    }
}

// Singleton instance
let concurrentTransactionManager: ConcurrentTransactionManager | null = null;

export function getConcurrentTransactionManager(): ConcurrentTransactionManager {
    if (!concurrentTransactionManager) {
        concurrentTransactionManager = new ConcurrentTransactionManager();
    }
    return concurrentTransactionManager;
}