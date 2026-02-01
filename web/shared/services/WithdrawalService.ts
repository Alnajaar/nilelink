/**
 * Withdrawal & Payout Service
 * Handles financial settlement requests for Suppliers, Drivers, and Merchants
 */

export interface PayoutRequest {
    userId: string;
    amount: number;
    method: 'CRYPTO' | 'CASH' | 'BANK';
    ownerType: 'SUPPLIER' | 'BUSINESS' | 'DRIVER';
    details?: string;
}

export interface SettlementRecord {
    id: string;
    amount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    method: string;
    createdAt: string;
}

class WithdrawalService {
    private baseUrl = '/api/payouts';

    /**
     * Submit a new payout request to the backend
     */
    async requestPayout(data: PayoutRequest): Promise<{ success: boolean; message: string; settlement?: SettlementRecord }> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to request payout');
            }

            return await response.json();
        } catch (error: any) {
            console.error('[WithdrawalService] Request failed:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Fetch payout history for a user
     */
    async getPayoutHistory(userId: string): Promise<SettlementRecord[]> {
        try {
            const response = await fetch(`${this.baseUrl}?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to fetch payout history');
            return await response.json();
        } catch (error) {
            console.error('[WithdrawalService] History fetch failed:', error);
            return [];
        }
    }
}

export const withdrawalService = new WithdrawalService();
