
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { NegotiationStatus, NegotiationProposer } from '@prisma/client';

class AgentNegotiationService extends EventEmitter {

    constructor() {
        super();
    }

    /**
     * Buyer initiates a Smart Procurement Agent
     */
    public async startNegotiation(buyerId: string, listingId: string, initialOffer: number, maxBudget: number): Promise<any> {
        
        // Create Session in DB
        const negotiation = await prisma.negotiationSession.create({
            data: {
                buyer: { connect: { userId: buyerId } }, // Assuming User(id) is same as userId or linked
                listing: { connect: { id: listingId } },
                initialOffer,
                maxBudget,
                status: 'ACTIVE', // Using string literal or enum if imported
                rounds: {
                    create: {
                        roundNumber: 1,
                        proposer: 'BUYER',
                        amount: initialOffer,
                        reason: 'Initial strategic offer'
                    }
                }
            },
            include: { rounds: true }
        });

        // Trigger automated response logic (Simulating Seller Agent)
        this.processSellerCounter(negotiation.id);
        
        return negotiation;
    }

    public async getNegotiation(id: string) {
        return prisma.negotiationSession.findUnique({
            where: { id },
            include: { rounds: { orderBy: { roundNumber: 'asc' } } }
        });
    }

    /**
     * Simulates the Seller Agent's logic (The "Other Bot")
     */
    private async processSellerCounter(negotiationId: string) {
        // Delay to simulate "thinking" or async processing
        setTimeout(async () => {
            const neg = await this.getNegotiation(negotiationId);
            if (!neg || neg.status !== 'ACTIVE') return;

            const lastRound = neg.rounds[neg.rounds.length - 1];
            const lastOffer = Number(lastRound.amount);
            
            // Assume listing price is effectively the seller's "Ideal"
            // For mock purposes, let's say the listing was $100
            // Ideally we fetch the listing price here:
            // const listing = await prisma.marketplaceListing.findUnique(...) 
            // But for this persistent-demo, we'll keep the logic simple.
            const targetPrice = 100; 
            
            let nextAction: { amount: number; reason: string; status?: NegotiationStatus };

            if (lastOffer >= targetPrice * 0.95) {
                // ACCEPT
                nextAction = { amount: lastOffer, reason: 'Fair market value accepted.', status: 'AGREED' };
                this.emit('negotiation:agreed', neg);
            } else {
                // COUNTER
                const counterOffer = Math.min(targetPrice, lastOffer * 1.15); // meet in middle-ish
                nextAction = { amount: counterOffer, reason: 'Offer too low based on current demand.' };
            }

            // Write Round to DB
            await prisma.$transaction([
                prisma.negotiationRound.create({
                    data: {
                        sessionId: neg.id,
                        roundNumber: neg.rounds.length + 1,
                        proposer: 'SELLER',
                        amount: nextAction.amount,
                        reason: nextAction.reason
                    }
                }),
                ...(nextAction.status ? [
                    prisma.negotiationSession.update({
                        where: { id: neg.id },
                        data: { status: nextAction.status }
                    })
                ] : [])
            ]);

            // Trigger Buyer Agent response if still active
            if (!nextAction.status) {
                this.processBuyerCounter(negotiationId);
            }

        }, 2000);
    }

    private async processBuyerCounter(negotiationId: string) {
         setTimeout(async () => {
            const neg = await this.getNegotiation(negotiationId);
            if (!neg || neg.status !== 'ACTIVE') return;

            const lastRound = neg.rounds[neg.rounds.length - 1];
            const lastSellerOffer = Number(lastRound.amount);
            const maxBudget = Number(neg.maxBudget);

            let nextAction: { amount: number; reason: string; status?: NegotiationStatus };

            if (lastSellerOffer <= maxBudget) {
                // ACCEPT
                nextAction = { amount: lastSellerOffer, reason: 'Price within budget. Auto-accepted.', status: 'AGREED' };
                this.emit('negotiation:agreed', neg);
            } else {
                // Determine if we walk away or nudge up
                if (lastSellerOffer - maxBudget < 5) {
                    // Fail
                    nextAction = { amount: maxBudget, reason: 'Exceeds strict budget cap.', status: 'FAILED' };
                } else {
                     // Counter with max budget
                    nextAction = { amount: maxBudget, reason: 'Final offer at budget limit.' };
                }
            }

             // Write Round to DB
            await prisma.$transaction([
                prisma.negotiationRound.create({
                    data: {
                        sessionId: neg.id,
                        roundNumber: neg.rounds.length + 1,
                        proposer: 'BUYER',
                        amount: nextAction.amount,
                        reason: nextAction.reason
                    }
                }),
                ...(nextAction.status ? [
                    prisma.negotiationSession.update({
                        where: { id: neg.id },
                        data: { status: nextAction.status }
                    })
                ] : [])
            ]);

            if (!nextAction.status) {
                this.processSellerCounter(negotiationId);
            }
         }, 2000);
    }
}

export const agentNegotiation = new AgentNegotiationService();

