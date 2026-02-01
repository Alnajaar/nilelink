/**
 * Branch Isolation Service - Ensures Complete Data Separation Between Branches
 * 
 * Implements strict data partitioning to prevent cross-branch contamination
 * All data operations are scoped to the current branch only
 */

import { LocalLedger } from '@/lib/storage/LocalLedger';
import { EventEngine } from '@/lib/events/EventEngine';

export interface BranchScopedOperation<T> {
    branchId: string;
    operation: string;
    timestamp: number;
    data: T;
}

export class BranchIsolationService {
    private ledger: LocalLedger | null = null;
    private eventEngine: EventEngine | null = null;
    private activeBranchId: string = '';

    constructor(ledger: LocalLedger, eventEngine: EventEngine) {
        this.ledger = ledger;
        this.eventEngine = eventEngine;
        this.setupBranchListeners();
    }

    /**
     * Set the active branch for all operations
     */
    setActiveBranch(branchId: string): void {
        if (!branchId) {
            throw new Error('Branch ID is required');
        }
        
        this.activeBranchId = branchId;
        console.log(`🔒 Branch isolation activated for: ${branchId}`);
    }

    /**
     * Execute operation with branch scoping
     */
    async executeScoped<T>(
        operation: string,
        executor: (scopedLedger: ScopedLedger) => Promise<T>
    ): Promise<T> {
        if (!this.activeBranchId) {
            throw new Error('No active branch set. Call setActiveBranch() first.');
        }

        if (!this.ledger) {
            throw new Error('Ledger not initialized');
        }

        // Create scoped ledger that only operates on current branch data
        const scopedLedger = new ScopedLedger(this.ledger, this.activeBranchId);
        
        try {
            const result = await executor(scopedLedger);
            
            // Log the operation for audit trail
            this.logOperation(operation, result);
            
            return result;
        } catch (error) {
            console.error(`❌ Branch-scoped operation failed: ${operation}`, error);
            throw error;
        }
    }

    /**
     * Validate that operation is within correct branch scope
     */
    validateBranchScope(branchId: string): boolean {
        if (this.activeBranchId !== branchId) {
            console.warn(`⚠️ Cross-branch access detected! Active: ${this.activeBranchId}, Requested: ${branchId}`);
            return false;
        }
        return true;
    }

    /**
     * Setup listeners for branch-related events
     */
    private setupBranchListeners(): void {
        if (!this.eventEngine) return;

        this.eventEngine.on('ACTIVE_BRANCH_CHANGED', (data: any) => {
            this.setActiveBranch(data.branchId);
        });

        this.eventEngine.on('BRANCH_DATA_ACCESS_ATTEMPT', (data: any) => {
            if (!this.validateBranchScope(data.requestedBranchId)) {
                this.eventEngine?.emit('BRANCH_ACCESS_VIOLATION', {
                    attemptedBranchId: data.requestedBranchId,
                    activeBranchId: this.activeBranchId,
                    operation: data.operation,
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Log branch-scoped operations for audit
     */
    private logOperation<T>(operation: string, data: T): void {
        const logEntry: BranchScopedOperation<T> = {
            branchId: this.activeBranchId,
            operation,
            timestamp: Date.now(),
            data
        };

        localStorage.setItem(
            `branch_audit_${this.activeBranchId}_${Date.now()}`,
            JSON.stringify(logEntry)
        );
    }

    /**
     * Get audit logs for current branch
     */
    getAuditLogs(branchId: string, limit: number = 100): BranchScopedOperation<any>[] {
        const logs: BranchScopedOperation<any>[] = [];
        const keys = Object.keys(localStorage);
        
        for (const key of keys) {
            if (key.startsWith(`branch_audit_${branchId}_`)) {
                try {
                    const log = JSON.parse(localStorage.getItem(key) || '{}');
                    logs.push(log);
                } catch (error) {
                    console.error('Failed to parse audit log:', error);
                }
            }
        }

        return logs
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Clear audit logs older than specified days
     */
    async clearOldAuditLogs(days: number = 30): Promise<void> {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const keys = Object.keys(localStorage);
        
        for (const key of keys) {
            if (key.startsWith('branch_audit_')) {
                try {
                    const log = JSON.parse(localStorage.getItem(key) || '{}');
                    if (log.timestamp < cutoffTime) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    localStorage.removeItem(key); // Remove corrupted entries
                }
            }
        }
    }
}

/**
 * Scoped Ledger - Wraps LocalLedger to enforce branch isolation
 */
export class ScopedLedger {
    private baseLedger: LocalLedger;
    private branchId: string;

    constructor(baseLedger: LocalLedger, branchId: string) {
        this.baseLedger = baseLedger;
        this.branchId = branchId;
    }

    /**
     * Add transaction scoped to current branch
     */
    async addTransaction(transaction: any): Promise<string> {
        const branchScopedTx = {
            ...transaction,
            branchId: this.branchId,
            createdAt: Date.now()
        };
        
        return await this.baseLedger.addTransaction(branchScopedTx);
    }

    /**
     * Get transactions for current branch only
     */
    async getTransactions(options?: {
        limit?: number;
        offset?: number;
        startDate?: number;
        endDate?: number;
    }): Promise<any[]> {
        const allTransactions = await this.baseLedger.getTransactions(options);
        return allTransactions.filter(tx => tx.branchId === this.branchId);
    }

    /**
     * Get transaction by ID with branch validation
     */
    async getTransactionById(id: string): Promise<any | null> {
        const transaction = await this.baseLedger.getTransactionById(id);
        if (transaction && transaction.branchId === this.branchId) {
            return transaction;
        }
        return null;
    }

    /**
     * Add staff member scoped to current branch
     */
    async addStaff(staff: any): Promise<string> {
        const branchScopedStaff = {
            ...staff,
            branchId: this.branchId,
            createdAt: Date.now()
        };
        
        return await this.baseLedger.addStaff(branchScopedStaff);
    }

    /**
     * Get staff members for current branch only
     */
    async getStaff(): Promise<any[]> {
        const allStaff = await this.baseLedger.getStaff();
        return allStaff.filter(staff => staff.branchId === this.branchId);
    }

    /**
     * Get staff by ID with branch validation
     */
    async getStaffById(id: string): Promise<any | null> {
        const staff = await this.baseLedger.getStaffById(id);
        if (staff && staff.branchId === this.branchId) {
            return staff;
        }
        return null;
    }

    /**
     * Update inventory item scoped to current branch
     */
    async updateInventory(productId: string, quantity: number, location?: string): Promise<void> {
        await this.baseLedger.updateInventory(productId, quantity, {
            branchId: this.branchId,
            location: location || 'main-storage',
            lastUpdated: Date.now()
        });
    }

    /**
     * Get inventory for current branch only
     */
    async getInventory(): Promise<any[]> {
        const allInventory = await this.baseLedger.getInventory();
        return allInventory.filter(item => item.metadata?.branchId === this.branchId);
    }

    /**
     * Get low stock items for current branch
     */
    async getLowStockItems(threshold: number = 10): Promise<any[]> {
        const inventory = await this.getInventory();
        return inventory.filter(item => item.quantity <= threshold);
    }

    /**
     * Add order scoped to current branch
     */
    async addOrder(order: any): Promise<string> {
        const branchScopedOrder = {
            ...order,
            branchId: this.branchId,
            createdAt: Date.now()
        };
        
        return await this.baseLedger.addOrder(branchScopedOrder);
    }

    /**
     * Get orders for current branch only
     */
    async getOrders(options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<any[]> {
        const allOrders = await this.baseLedger.getOrders(options);
        return allOrders.filter(order => order.branchId === this.branchId);
    }

    /**
     * Update order status with branch validation
     */
    async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
        const order = await this.getOrderById(orderId);
        if (!order) return false;

        return await this.baseLedger.updateOrderStatus(orderId, status);
    }

    /**
     * Get order by ID with branch validation
     */
    async getOrderById(id: string): Promise<any | null> {
        const order = await this.baseLedger.getOrderById(id);
        if (order && order.branchId === this.branchId) {
            return order;
        }
        return null;
    }

    // Delegate other methods that don't require branching
    async getLastEventHash(): Promise<string> {
        return await this.baseLedger.getLastEventHash();
    }

    async getUnsyncedEvents(): Promise<any[]> {
        return await this.baseLedger.getUnsyncedEvents();
    }

    async markEventAsSynced(eventHash: string): Promise<void> {
        return await this.baseLedger.markEventAsSynced(eventHash);
    }
}

// Singleton instance
let branchIsolationService: BranchIsolationService | null = null;

export function getBranchIsolationService(ledger: LocalLedger, eventEngine: EventEngine): BranchIsolationService {
    if (!branchIsolationService) {
        branchIsolationService = new BranchIsolationService(ledger, eventEngine);
    }
    return branchIsolationService;
}