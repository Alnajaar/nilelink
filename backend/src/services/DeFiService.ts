
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { LoanStatus } from '@prisma/client';

interface LoanRequest {
    sellerId: string;
    amount: number;
    orderIds: string[]; // Collateral
}

class DeFiService extends EventEmitter {

    constructor() {
        super();
    }

    /**
     * Calculates maximum loanable amount based on trust score and pending orders
     */
    public async getCreditLimit(sellerId: string): Promise<{ limit: number; trustScore: number }> {
        // In a real implementation, we would query `prisma.marketplaceOrder` 
        // to calculate actual pending value.
        // For now, we keep the calculation logic but fetch the seller's trust score from DB.

        const seller = await prisma.marketplaceSeller.findUnique({
            where: { userId: sellerId }
        });

        // Default or fetched trust score
        const trustScore = seller?.trustScore ? Number(seller.trustScore) : 95;

        // MOCK: Fetch pending potential collateral
        const pendingValue = 15000;

        let limit = 0;
        if (trustScore > 90) limit = pendingValue * 0.8; // 80% LTV
        else if (trustScore > 70) limit = pendingValue * 0.5; // 50% LTV

        return { limit, trustScore };
    }

    /**
     * Instant Approval Logic with Persistence
     */
    public async requestCapital(request: LoanRequest): Promise<any> {
        logger.info(`[DeFi] Analyzing capital request for ${request.sellerId}: $${request.amount}`);

        const { limit } = await this.getCreditLimit(request.sellerId);

        if (request.amount > limit) {
            throw new Error(`Amount exceeds credit limit of $${limit}`);
        }

        // Persist Loan to Database
        const loan = await prisma.marketplaceLoan.create({
            data: {
                seller: { connect: { userId: request.sellerId } }, // Assuming seller exists
                amount: request.amount,
                interestRate: 0.025,
                durationDays: 30,
                status: LoanStatus.ACTIVE,
                disbursedAt: new Date(),
                orderIds: request.orderIds
            }
        });

        // Emit event for accounting sync
        this.emit('defi:loan-issued', {
            loanId: loan.id,
            sellerId: request.sellerId,
            amount: request.amount
        });

        return loan;
    }
}

export const defiService = new DeFiService();
