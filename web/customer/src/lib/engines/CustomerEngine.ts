/**
 * CustomerEngine - Business Logic for Customer App
 */

import { OrderLedger, ImmutableReceipt } from './OrderLedger';

export class CustomerEngine {
    private ledger: OrderLedger;

    constructor() {
        this.ledger = new OrderLedger();
    }

    async placeOrder(merchant: any, cart: any): Promise<string> {
        const orderId = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
        const timestamp = Date.now();

        const receipt: ImmutableReceipt = {
            id: orderId,
            merchantName: merchant.name,
            merchantId: merchant.id,
            items: cart,
            total: cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
            timestamp,
            status: 'PENDING',
            orderHash: `hash_${orderId}_${timestamp}` // In prod, use SHA-256
        };

        await this.ledger.saveReceipt(receipt);
        return orderId;
    }

    async getMerchantStatus(id: string): Promise<'OPEN' | 'CLOSED' | 'BUSY'> {
        // Mocking protocol events
        const hours = new Date().getHours();
        if (hours < 9 || hours > 23) return 'CLOSED';
        if (hours > 12 && hours < 14) return 'BUSY';
        return 'OPEN';
    }
}
