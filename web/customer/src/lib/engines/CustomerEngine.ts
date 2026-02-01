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
        const timestamp = Date.now();
        const orderHash = (await import('ethers')).ethers.keccak256(
            (await import('ethers')).ethers.toUtf8Bytes(`${merchant.id}-${timestamp}-${Math.random()}`)
        );
        const orderId = `ORD-${orderHash.substring(2, 10).toUpperCase()}`;

        const receipt: ImmutableReceipt = {
            id: orderId,
            merchantName: merchant.name,
            merchantId: merchant.id,
            total: cart.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0),
            items: cart.map((item: any) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            })),
            timestamp,
            status: 'PENDING',
            orderHash
        };

        await this.ledger.saveReceipt(receipt);
        return orderId;
    }

    async getMerchantStatus(id: string): Promise<'OPEN' | 'CLOSED' | 'BUSY'> {
        try {
            const graphService = (await import('@shared/services/GraphService')).default;
            const data = await graphService.getRestaurantById(id);

            if (!data || !data.restaurant) return 'CLOSED';

            // Subgraph status check (mapped to protocol enum)
            const status = data.restaurant.status?.toLowerCase();
            if (status === 'active') return 'OPEN';
            if (status === 'busy') return 'BUSY';
            return 'CLOSED';
        } catch (error) {
            console.error('[CustomerEngine] Failed to fetch on-chain merchant status:', error);
            return 'CLOSED';
        }
    }
}
