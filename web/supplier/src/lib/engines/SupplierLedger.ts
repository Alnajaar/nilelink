/**
 * SupplierLedger - Private B2B Ledger for Supplier Hub
 * Manages supply events, catalogs, and credit balances via Prisma API.
 */

export interface SupplyEvent {
    id: string;
    type: 'ORDER_PLACED' | 'PAYMENT_RECEIVED' | 'DEBT_ADJUSTED' | 'LIMIT_INCREASED';
    timestamp: string;
    accountId: string;
    amount: number;
    description?: string;
    account?: any;
}

export interface CreditRecord {
    id: string;
    merchantId: string;
    merchantName: string;
    balance: number; // Positive = Debt owed to supplier
    creditLimit: number;
    lastPaymentAt: string | null;
    riskLevel: string;
}

export class SupplierLedger {
    private supplierId: string | null = null;

    constructor(supplierId?: string) {
        this.supplierId = supplierId || null;
    }

    setSupplierId(id: string) {
        this.supplierId = id;
    }

    /**
     * Fetch all ledger data for the current supplier
     */
    async getData(): Promise<{ events: SupplyEvent[], credits: CreditRecord[] }> {
        if (!this.supplierId) {
            console.warn('[Ledger] No supplierId provided, returning empty set.');
            return { events: [], credits: [] };
        }

        try {
            const response = await fetch(`/api/ledger?supplierId=${this.supplierId}`);
            if (!response.ok) throw new Error('Failed to fetch ledger data');
            return await response.json();
        } catch (error) {
            console.error('[Ledger] Fetch failed:', error);
            return { events: [], credits: [] };
        }
    }

    /**
     * Record a new financial event (Debt or Payment)
     */
    async recordEvent(data: {
        merchantId: string,
        merchantName?: string,
        type: SupplyEvent['type'],
        amount: number,
        description?: string
    }): Promise<boolean> {
        if (!this.supplierId) return false;

        try {
            const response = await fetch('/api/ledger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId: this.supplierId,
                    ...data
                })
            });

            return response.ok;
        } catch (error) {
            console.error('[Ledger] Save failed:', error);
            return false;
        }
    }

    /**
     * Utility to update credit balance (wraps recordEvent)
     */
    async updateCreditBalance(merchantId: string, amount: number, description?: string) {
        return this.recordEvent({
            merchantId,
            type: amount < 0 ? 'PAYMENT_RECEIVED' : 'DEBT_ADJUSTED',
            amount,
            description
        });
    }
}
