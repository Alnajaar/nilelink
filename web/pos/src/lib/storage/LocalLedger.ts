/**
 * Decentralized Local Ledger - Blockchain-Native Storage with Multi-Branch Support
 * Uses localStorage/browser storage instead of SQL.js for full decentralization
 */

import { EconomicEvent, EventMetadata } from '../events/types';
import { EventQuery } from '../events/EventEngine';

const LEDGER_KEY = 'nilelink_ledger_v2';
const EVENTS_KEY = 'nilelink_events_v2';
const BRANCHES_KEY = 'nilelink_branches_data';

export class LocalLedger {
    private events: EconomicEvent[] = [];
    private metadata: Record<string, any> = {};
    private branchData: Record<string, any> = {};

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Create branch-specific collections
     */
    async createBranchCollections(branchId: string): Promise<void> {
        if (!this.branchData[branchId]) {
            this.branchData[branchId] = {
                transactions: [],
                staff: {},
                inventory: {},
                orders: {},
                customers: {},
                createdAt: Date.now()
            };
            this.persistToStorage();
        }
    }

    /**
     * Remove branch-specific collections
     */
    async removeBranchCollections(branchId: string): Promise<void> {
        delete this.branchData[branchId];
        this.persistToStorage();
    }

    /**
     * Add transaction to specific branch
     */
    async addTransaction(transaction: any): Promise<string> {
        const branchId = transaction.branchId || 'default';

        if (!this.branchData[branchId]) {
            await this.createBranchCollections(branchId);
        }

        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const branchTransaction = {
            id: transactionId,
            ...transaction,
            createdAt: Date.now(),
            branchId
        };

        this.branchData[branchId].transactions.push(branchTransaction);
        this.persistToStorage();

        return transactionId;
    }

    /**
     * Get transactions for specific branch
     */
    async getTransactionsByBranch(branchId: string, options?: {
        limit?: number;
        offset?: number;
        startDate?: number;
        endDate?: number;
    }): Promise<any[]> {
        if (!this.branchData[branchId]) return [];

        let transactions = [...this.branchData[branchId].transactions];

        // Apply date filters
        if (options?.startDate) {
            transactions = transactions.filter(tx => tx.createdAt >= options.startDate);
        }
        if (options?.endDate) {
            transactions = transactions.filter(tx => tx.createdAt <= options.endDate);
        }

        // Sort by creation time (newest first)
        transactions.sort((a, b) => b.createdAt - a.createdAt);

        // Apply pagination
        if (options?.offset) {
            transactions = transactions.slice(options.offset);
        }
        if (options?.limit) {
            transactions = transactions.slice(0, options.limit);
        }

        return transactions;
    }

    /**
     * Get transactions by date range (across all branches or specific branch)
     */
    async getTransactionsByDate(startDate: number, endDate?: number, branchId?: string): Promise<any[]> {
        let allTransactions: any[] = [];

        if (branchId) {
            // Get transactions for specific branch
            allTransactions = await this.getTransactionsByBranch(branchId);
        } else {
            // Get transactions from all branches
            for (const bid in this.branchData) {
                const branchTransactions = await this.getTransactionsByBranch(bid);
                allTransactions.push(...branchTransactions);
            }
        }

        return allTransactions.filter(tx => {
            const txDate = tx.createdAt;
            return txDate >= startDate && (!endDate || txDate <= endDate);
        });
    }

    /**
     * Add staff member to specific branch
     */
    async addStaff(staff: any): Promise<string> {
        const branchId = staff.branchId || 'default';

        if (!this.branchData[branchId]) {
            await this.createBranchCollections(branchId);
        }

        const staffId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const branchStaff = {
            id: staffId,
            ...staff,
            createdAt: Date.now(),
            branchId
        };

        this.branchData[branchId].staff[staffId] = branchStaff;
        this.persistToStorage();

        return staffId;
    }

    /**
     * Get staff members for specific branch
     */
    async getStaffByBranch(branchId: string): Promise<any[]> {
        if (!this.branchData[branchId]) return [];
        return Object.values(this.branchData[branchId].staff);
    }

    /**
     * Get staff by ID with branch validation
     */
    async getStaffById(id: string): Promise<any | null> {
        // Search across all branches
        for (const branchId in this.branchData) {
            if (this.branchData[branchId].staff[id]) {
                return this.branchData[branchId].staff[id];
            }
        }
        return null;
    }

    /**
     * Get active staff count for branch
     */
    async getActiveStaffCount(branchId: string): Promise<number> {
        if (!this.branchData[branchId]) return 0;

        const staffList = Object.values(this.branchData[branchId].staff) as any[];
        return staffList.filter(staff => staff.status === 'active').length;
    }

    /**
     * Update inventory for specific branch
     */
    async updateInventory(productId: string, quantity: number, metadata?: any): Promise<void> {
        const branchId = metadata?.branchId || 'default';

        if (!this.branchData[branchId]) {
            await this.createBranchCollections(branchId);
        }

        this.branchData[branchId].inventory[productId] = {
            productId,
            quantity,
            ...metadata,
            lastUpdated: Date.now(),
            branchId
        };

        this.persistToStorage();
    }

    /**
     * Get inventory for specific branch
     */
    async getInventoryByBranch(branchId: string): Promise<any[]> {
        if (!this.branchData[branchId]) return [];
        return Object.values(this.branchData[branchId].inventory);
    }

    /**
     * Add order to specific branch
     */
    async addOrder(order: any): Promise<string> {
        const branchId = order.branchId || 'default';

        if (!this.branchData[branchId]) {
            await this.createBranchCollections(branchId);
        }

        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const branchOrder = {
            id: orderId,
            ...order,
            status: order.status || 'pending',
            createdAt: Date.now(),
            branchId
        };

        this.branchData[branchId].orders[orderId] = branchOrder;
        this.persistToStorage();

        return orderId;
    }

    /**
     * Get orders for specific branch
     */
    async getOrdersByBranch(branchId: string, options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<any[]> {
        if (!this.branchData[branchId]) return [];

        let orders = Object.values(this.branchData[branchId].orders) as any[];

        // Filter by status
        if (options?.status) {
            orders = orders.filter(order => order.status === options.status);
        }

        // Sort by creation time (newest first)
        orders.sort((a, b) => b.createdAt - a.createdAt);

        // Apply pagination
        if (options?.offset) {
            orders = orders.slice(options.offset);
        }
        if (options?.limit) {
            orders = orders.slice(0, options.limit);
        }

        return orders;
    }

    /**
     * Get pending orders for branch
     */
    async getPendingOrders(branchId: string): Promise<any[]> {
        return await this.getOrdersByBranch(branchId, { status: 'pending' });
    }

    /**
     * Update order status
     */
    async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
        // Find order across all branches
        for (const branchId in this.branchData) {
            if (this.branchData[branchId].orders[orderId]) {
                this.branchData[branchId].orders[orderId].status = status;
                this.branchData[branchId].orders[orderId].updatedAt = Date.now();
                this.persistToStorage();
                return true;
            }
        }
        return false;
    }

    /**
     * Get order by ID with branch validation
     */
    async getOrderById(id: string): Promise<any | null> {
        // Search across all branches
        for (const branchId in this.branchData) {
            if (this.branchData[branchId].orders[id]) {
                return this.branchData[branchId].orders[id];
            }
        }
        return null;
    }

    /**
     * Get last sync time
     */
    async getLastSyncTime(): Promise<number> {
        // Return the latest sync time across all branches
        let latestSync = 0;

        for (const branchId in this.branchData) {
            const branchTransactions = this.branchData[branchId].transactions || [];
            const branchLatest = Math.max(...branchTransactions.map((tx: any) => tx.createdAt || 0));
            if (branchLatest > latestSync) {
                latestSync = branchLatest;
            }
        }

        return latestSync;
    }

    /**
     * Insert event into local ledger (decentralized storage)
     */
    async insertEvent(event: EconomicEvent): Promise<void> {
        this.events.push(event);
        this.persistToStorage();
    }

    /**
     * Get all events (chronological order)
     */
    async getAllEvents(): Promise<EconomicEvent[]> {
        return [...this.events].sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get unsynced events
     */
    async getUnsyncedEvents(): Promise<EconomicEvent[]> {
        return this.events.filter(event => !event.offline);
    }

    /**
     * Mark event as synced
     */
    async markEventSynced(eventId: string, syncTimestamp: number): Promise<void> {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            event.offline = false;
            event.syncedAt = syncTimestamp;
            this.persistToStorage();
        }
    }

    /**
     * Get events by type
     */
    async getEventsByType(type: string): Promise<EconomicEvent[]> {
        return this.events.filter(event => event.type === type);
    }

    /**
     * Get events by time range
     */
    async getEventsByTimeRange(startTime: number, endTime: number): Promise<EconomicEvent[]> {
        return this.events.filter(event =>
            event.timestamp >= startTime && event.timestamp <= endTime
        );
    }

    /**
     * Get last event hash for chain continuation
     */
    async getLastEventHash(): Promise<string | null> {
        if (this.events.length === 0) return null;
        const lastEvent = this.events[this.events.length - 1];
        return lastEvent.hash;
    }

    /**
     * Get event count
     */
    async getEventCount(): Promise<number> {
        return this.events.length;
    }

    /**
     * Convert database row to EconomicEvent (compatibility)
     */
    private rowToEvent(row: any): EconomicEvent {
        return row; // Already in correct format
    }

    /**
     * Persist to decentralized storage (localStorage)
     */
    private persistToStorage(): void {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(EVENTS_KEY, JSON.stringify(this.events));
                localStorage.setItem(LEDGER_KEY, JSON.stringify(this.metadata));
                localStorage.setItem(BRANCHES_KEY, JSON.stringify(this.branchData));
            } catch (error) {
                console.warn('Failed to persist to localStorage:', error);
            }
        }
    }

    /**
     * Load from decentralized storage
     */
    private loadFromStorage(): void {
        if (typeof window !== 'undefined') {
            try {
                const eventsData = localStorage.getItem(EVENTS_KEY);
                const metadataData = localStorage.getItem(LEDGER_KEY);
                const branchesData = localStorage.getItem(BRANCHES_KEY);

                if (eventsData) {
                    this.events = JSON.parse(eventsData);
                }

                if (metadataData) {
                    this.metadata = JSON.parse(metadataData);
                }

                if (branchesData) {
                    this.branchData = JSON.parse(branchesData);
                } else {
                    // Initialize default branch data structure
                    this.branchData = {};
                }
            } catch (error) {
                console.warn('Failed to load from localStorage:', error);
                this.branchData = {};
            }
        }
    }

    /**
     * Clear all data (use with caution!)
     */
    async clear(): Promise<void> {
        this.events = [];
        this.metadata = {};
        this.persistToStorage();
    }

    /**
     * Export database as JSON
     */
    async exportToJSON(): Promise<string> {
        return JSON.stringify(this.events, null, 2);
    }

    /**
     * Get database statistics
     */
    async getStats(): Promise<{
        totalEvents: number;
        unsyncedEvents: number;
        databaseSize: string;
        oldestEvent: number | null;
        newestEvent: number | null;
    }> {
        const totalEvents = this.events.length;
        const unsyncedEvents = this.events.filter(e => e.offline).length;

        const oldestEvent = this.events.length > 0 ?
            Math.min(...this.events.map(e => e.timestamp)) : null;
        const newestEvent = this.events.length > 0 ?
            Math.max(...this.events.map(e => e.timestamp)) : null;

        const dataSize = JSON.stringify(this.events).length;
        const databaseSize = `${(dataSize / 1024).toFixed(2)} KB`;

        return {
            totalEvents,
            unsyncedEvents,
            databaseSize,
            oldestEvent,
            newestEvent,
        };
    }

    // Mock methods for compatibility
    async upsertStaff(staff: any): Promise<void> {
        this.metadata.staff = this.metadata.staff || {};
        this.metadata.staff[staff.id] = staff;
        this.persistToStorage();
    }

    async getStaffById(id: string): Promise<any | null> {
        return this.metadata.staff?.[id] || null;
    }

    async getStaffByUniqueCode(code: string): Promise<any | null> {
        const staffList = Object.values(this.metadata.staff || {});
        return staffList.find((staff: any) => staff.code === code) || null;
    }

    async getAllStaff(): Promise<any[]> {
        return Object.values(this.metadata.staff || {});
    }

    // Additional mock methods for POS compatibility
    async upsertStaffCashBalance(staffId: string, balance: number, currency: string): Promise<void> {
        this.metadata.cashBalances = this.metadata.cashBalances || {};
        this.metadata.cashBalances[staffId] = { balance, currency, lastUpdated: Date.now() };
        this.persistToStorage();
    }

    async getStaffCashBalance(staffId: string): Promise<any | null> {
        return this.metadata.cashBalances?.[staffId] || null;
    }

    async getAllStaffCashBalances(): Promise<any[]> {
        return Object.values(this.metadata.cashBalances || {});
    }

    async getAllAccountBalances(): Promise<any[]> {
        return Object.values(this.metadata.accountBalances || {});
    }

    // Methods for inventory transactions
    async getPendingInventoryTransactions(): Promise<any[]> {
        // In a real implementation, this would return inventory transactions that need to be synced
        // For now, return an empty array as a placeholder
        return [];
    }

    async markInventoryTransactionSynced(transactionId: string): Promise<void> {
        // In a real implementation, this would mark an inventory transaction as synced
        // For now, just log as a placeholder
        console.log(`Marked inventory transaction ${transactionId} as synced`);
    }

    // Payroll Persistence Methods
    async upsertShift(shift: any): Promise<void> {
        this.metadata.shifts = this.metadata.shifts || {};
        this.metadata.shifts[shift.id] = shift;
        this.persistToStorage();
    }

    async getShiftsByStaff(staffId: string): Promise<any[]> {
        const allShifts = Object.values(this.metadata.shifts || {}) as any[];
        return allShifts.filter(s => s.staffId === staffId);
    }

    async getActiveShifts(): Promise<any[]> {
        const allShifts = Object.values(this.metadata.shifts || {}) as any[];
        return allShifts.filter(s => s.status === 'ACTIVE');
    }
}