import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { prisma } from './DatabasePoolService';
import { JuryStatus, VoteChoice } from '@prisma/client';

class JuryService extends EventEmitter {

    constructor() {
        super();
        this.ensureDemoCase();
    }

    private async ensureDemoCase() {
        // Ensure at least one case exists for the demo
        try {
            // Check if juryCase model exists by attempting to access it
            if (!(prisma as any).juryCase) {
                logger.warn('[Jury] Jury tables not found in schema, skipping demo case seeding');
                return;
            }

            const countResult = await (prisma as any).juryCase.count();
            // Handle different result formats from count queries
            const count = typeof countResult === 'number' ? countResult : 0;
            if (count === 0) {
                await (prisma as any).juryCase.create({
                    data: {
                        disputeId: 'DISP-DEMO-PERSISTED',
                        status: 'VOTING_OPEN',
                        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        votesForBuyer: 2,
                        votesForSeller: 1,
                        jurors: ['current-user', 'user_123', 'user_456']
                    }
                });
                logger.info('[Jury] Seeded demo case into DB.');
            }
        } catch (error) {
            logger.warn('[Jury] Could not seed demo case - table may not exist', error);
            // Continue - this is optional for development
        }
    }

    public async getCasesForJuror(userId: string): Promise<any[]> {
        // Prisma doesn't natively support array contains for scalar lists in sqlite/some adapters easily, 
        // but Postgres does. Assuming Postgres:
        return prisma.juryCase.findMany({
            where: {
                jurors: { has: userId },
                status: 'VOTING_OPEN'
            }
        });
    }

    public async castVote(caseId: string, userId: string, vote: VoteChoice): Promise<boolean> {
        const juryCase = await prisma.juryCase.findUnique({ where: { id: caseId } });

        if (!juryCase || juryCase.status !== 'VOTING_OPEN') {
            throw new Error('Case not open for voting');
        }

        // Check if already voted
        const existingVote = await prisma.juryVote.findUnique({
            where: {
                caseId_jurorId: { caseId, jurorId: userId }
            }
        });

        if (existingVote) {
            throw new Error('User has already voted on this case');
        }

        // Record Vote and Update Counts transactionally
        const updateData = vote === 'BUYER'
            ? { votesForBuyer: { increment: 1 } }
            : { votesForSeller: { increment: 1 } };

        const [createdVote, updatedCase] = await prisma.$transaction([
            prisma.juryVote.create({
                data: {
                    caseId,
                    jurorId: userId,
                    vote
                }
            }),
            prisma.juryCase.update({
                where: { id: caseId },
                data: updateData
            })
        ]);

        // Check Resolution Threshold (e.g., 5 total votes)
        const totalVotes = updatedCase.votesForBuyer + updatedCase.votesForSeller;
        if (totalVotes >= 5) {
            const winner = updatedCase.votesForBuyer > updatedCase.votesForSeller ? 'BUYER' : 'SELLER';

            await prisma.juryCase.update({
                where: { id: caseId },
                data: { status: 'RESOLVED' }
            });

            this.emit('jury:verdict', { caseId, winner });
        }

        return true;
    }
}

export const juryService = new JuryService();
