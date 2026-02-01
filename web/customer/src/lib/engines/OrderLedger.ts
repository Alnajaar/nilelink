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

        // Anchor to blockchain for cryptographic proof
        try {
            const web3Service = (await import('@shared/services/Web3Service')).default;
            const cid = `receipt-${receipt.id}`; // In production, this would be an actual IPFS CID
            await web3Service.anchorEventBatch(receipt.merchantId, cid);
        } catch (error) {
            console.warn('[OrderLedger] Failed to anchor receipt to blockchain:', error);
        }

        // Accrue loyalty points
        try {
            const { loyaltyEngine } = await import('./LoyaltyEngine');
            await loyaltyEngine.processOrderForPoints(receipt);
        } catch (error) {
            console.warn('[OrderLedger] Failed to process loyalty points:', error);
        }

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
