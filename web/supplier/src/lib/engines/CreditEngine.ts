/**
 * CreditEngine - Financial Trust Layer for Supplier Hub
 * Manages debt status, credit limits, and risk scoring via SupplierLedger API.
 */

import { SupplierLedger, CreditRecord } from './SupplierLedger';

export class CreditEngine {
    private ledger: SupplierLedger;

    constructor(supplierId?: string) {
        this.ledger = new SupplierLedger(supplierId);
    }

    setSupplierId(id: string) {
        this.ledger.setSupplierId(id);
    }

    async getCreditStatus(merchantId: string): Promise<{
        record: CreditRecord | undefined;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        color: string;
    }> {
        const { credits } = await this.ledger.getData();
        const record = credits.find((c: any) => c.merchantId === merchantId);

        if (!record) return { record: undefined, riskLevel: 'LOW', color: '#0FB9B1' };

        // Return the values directly from the DB record which are calculated on the backend
        // or recalculate here for UI responsiveness if needed.
        const riskLevel = record.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        let color = '#0FB9B1'; // Success

        if (riskLevel === 'CRITICAL') {
            color = '#D64545'; // Error
        } else if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
            color = '#F5A623'; // Warning
        }

        return { record, riskLevel, color };
    }

    async approveCreditOrder(merchantId: string, orderTotal: number): Promise<boolean> {
        const { record } = await this.getCreditStatus(merchantId);
        if (!record) return false;
        return (record.balance + orderTotal) <= (record.creditLimit * 1.1); // 10% grace
    }

    async getOverdueClients(): Promise<CreditRecord[]> {
        const { credits } = await this.ledger.getData();
        return credits.filter((c: any) =>
            c.balance > 0 &&
            c.lastPaymentAt &&
            (Date.now() - new Date(c.lastPaymentAt).getTime()) > 86400000 * 30
        );
    }
}
