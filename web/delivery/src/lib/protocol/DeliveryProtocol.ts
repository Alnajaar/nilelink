import { MobileLedger } from '../ledger/MobileLedger';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface ProtocolOrder {
    id: string;
    restaurantName: string;
    restaurantAddress: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    items: string[];
    price: number;
    paymentMethod: 'CASH' | 'EPAY';
    status: OrderStatus;
    priority: 'NORMAL' | 'HIGH' | 'RUSH';
}

export class DeliveryProtocol {
    private ledger: MobileLedger;

    constructor() {
        this.ledger = new MobileLedger();
    }

    // --- Actions ---

    async startShift(pin: string): Promise<boolean> {
        // Validate PIN (Mock)
        if (pin === '1234') {
            await this.ledger.recordEvent('SHIFT_OPEN', { method: 'PIN' });
            return true;
        }
        return false;
    }

    async endShift(confirmedBalance: number): Promise<boolean> {
        const sysBalance = await this.ledger.getCashBalance();
        const variance = confirmedBalance - sysBalance;

        await this.ledger.recordEvent('SHIFT_CLOSE', {
            confirmedBalance,
            sysBalance,
            variance
        });
        return true;
    }

    async acceptOrder(orderId: string): Promise<void> {
        await this.ledger.recordEvent('TASK_ACCEPTED', { orderId });
    }

    async pickupOrder(orderId: string): Promise<void> {
        await this.ledger.recordEvent('TASK_PICKED_UP', { orderId, location: 'mock-lat-long' });
    }

    async completeDelivery(orderId: string, proof: string, cashCollected: number): Promise<void> {
        // 1. Log Delivery
        await this.ledger.recordEvent('TASK_COMPLETED', { orderId, proof });

        // 2. Log Cash (if applicable)
        if (cashCollected > 0) {
            await this.ledger.recordEvent('CASH_COLLECTED', { orderId, amount: cashCollected });
        }
    }

    async failDelivery(orderId: string, reason: string): Promise<void> {
        await this.ledger.recordEvent('TASK_FAILED', { orderId, reason });
    }

    // --- Queries ---

    async getCashInHand(): Promise<number> {
        return this.ledger.getCashBalance();
    }

    async getShiftState(): Promise<'OPEN' | 'CLOSED'> {
        return this.ledger.getShiftStatus();
    }
}
