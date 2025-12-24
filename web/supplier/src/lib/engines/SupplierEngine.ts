/**
 * SupplierEngine - Main Business Logic for Supplier Hub
 * Orchestrates orders, fulfillment, and protocol events.
 */

import { SupplierLedger } from './SupplierLedger';
import { CreditEngine } from './CreditEngine';

export class SupplierEngine {
    private ledger: SupplierLedger;
    private credit: CreditEngine;

    constructor() {
        this.ledger = new SupplierLedger();
        this.credit = new CreditEngine();
    }

    async acceptOrder(clientId: string, orderId: string, total: number): Promise<boolean> {
        // Check credit before accepting
        const canApprove = await this.credit.approveCreditOrder(clientId, total);
        if (!canApprove) {
            console.error(`[SupplierEngine] Credit limit exceeded for client ${clientId}`);
            return false;
        }

        await this.ledger.recordEvent('ORDER_ACCEPTED', clientId, { orderId, total });
        return true;
    }

    async fulfillOrder(clientId: string, orderId: string, items: any[]): Promise<void> {
        const total = items.reduce((acc, i) => acc + (i.price * i.qty), 0);

        await this.ledger.recordEvent('ORDER_DELIVERED', clientId, { orderId, items, total });

        // Update debt on delivery (Cash on delivery is handled differently, this assumes Credit/Debt protocol)
        await this.ledger.updateCreditBalance(clientId, total);
    }

    async getDashboardStats(): Promise<{
        totalReceivables: number;
        overdueCount: number;
        activeOrders: number;
        inventoryHealth: string;
    }> {
        const data = this.ledger.getData();
        const stats = {
            totalReceivables: data.credits.reduce((acc: number, c: any) => acc + c.balance, 0),
            overdueCount: data.credits.filter((c: any) => c.balance > 0 && (Date.now() - (c.lastPaymentDate || 0)) > 86400000 * 30).length,
            activeOrders: data.events.filter((e: any) => e.type === 'ORDER_ACCEPTED').length,
            inventoryHealth: 'STABLE'
        };
        return stats;
    }
}
