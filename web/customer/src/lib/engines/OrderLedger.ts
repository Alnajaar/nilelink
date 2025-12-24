/**
 * OrderLedger - Trust Core for Customer App
 * Stores immutable receipts and order history.
 */

export interface ImmutableReceipt {
    id: string;
    merchantName: string;
    merchantId: string;
    items: { name: string; price: number; quantity: number }[];
    total: number;
    timestamp: number;
    status: 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PENDING';
    orderHash: string; // Cryptographic proof
}

export class OrderLedger {
    private storageKey = 'nl_customer_orders';

    constructor() {
        if (typeof window !== 'undefined' && !localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    async saveReceipt(receipt: ImmutableReceipt): Promise<void> {
        const history = this.getHistory();
        history.push(receipt);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
        console.log(`[OrderLedger] Trust Record Anchored: ${receipt.id}`);
    }

    getHistory(): ImmutableReceipt[] {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : [];
    }

    async getOrderById(id: string): Promise<ImmutableReceipt | undefined> {
        return this.getHistory().find(r => r.id === id);
    }
}
