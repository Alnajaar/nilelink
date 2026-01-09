/**
 * CreditEngine - Financial Trust Layer for Supplier Hub
 * Manages debt status, credit limits, and risk scoring.
 */

import { SupplierLedger, CreditRecord } from './SupplierLedger';

export class CreditEngine {
    private ledger: SupplierLedger;

    constructor() {
        this.ledger = new SupplierLedger();
    }

    async getCreditStatus(clientId: string): Promise<{
        record: CreditRecord | undefined;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        color: string;
    }> {
        const data = this.ledger.getData();
        const record = data.credits.find((c: any) => c.clientId === clientId);

        if (!record) return { record: undefined, riskLevel: 'LOW', color: '#0FB9B1' };

        const utilization = record.balance / record.limit;
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        let color = '#0FB9B1'; // Success

        if (utilization > 0.9 || record.balance > record.limit) {
            riskLevel = 'CRITICAL';
            color = '#D64545'; // Error
        } else if (utilization > 0.7) {
            riskLevel = 'HIGH';
            color = '#F5A623'; // Warning
        } else if (utilization > 0.4) {
            riskLevel = 'MEDIUM';
            color = '#F5A623'; // Warning
        }

        return { record, riskLevel, color };
    }

    async approveCreditOrder(clientId: string, orderTotal: number): Promise<boolean> {
        const { record } = await this.getCreditStatus(clientId);
        if (!record) return false;
        return (record.balance + orderTotal) <= (record.limit * 1.1); // 10% grace
    }

    async getOverdueClients(): Promise<CreditRecord[]> {
        const data = this.ledger.getData();
        return data.credits.filter((c: any) => c.balance > 0 && (Date.now() - (c.lastPaymentDate || 0)) > 86400000 * 30);
    }
}
