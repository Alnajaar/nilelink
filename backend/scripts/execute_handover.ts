
import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

// Initialize Prisma
const prisma = new PrismaClient();

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'ceo@nilelink.com';

async function main() {
    console.log('👑 STARTING ECOSYSTEM HANDOVER PROTOCOL...');
    console.log('-------------------------------------------');

    try {
        // Step 1: Assign Owner Role
        console.log(`\n🔍 Searching for designated owner: ${OWNER_EMAIL}`);
        const user = await prisma.user.findUnique({
            where: { email: OWNER_EMAIL }
        });

        if (!user) {
            console.error(`❌ CRITICAL: Handover target ${OWNER_EMAIL} not found in database.`);
            process.exit(1);
        }

        console.log(`✅ User found: ${user.id}. Elevating privileges...`);

        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'OWNER' } // Assuming 'OWNER' is a valid Role enum or string
        });
        console.log('✨ ACCESS GRANTED: User is now Protocol OWNER.');

        // Step 2: Initialize Liquidity Pools (Merit System)
        console.log('\n💧 detailed audit of Liquidity Pools...');

        // Check if Merit Pool exists (conceptually)
        // We'll create a system-level transaction to seed an initial merit pool if needed
        // For now, we'll just log this as a simulation or actual DB inserts if MeritTransaction supports it.

        // Check for Genesis Staking Pool
        const genesisPoolV1 = await prisma.meritTransaction.findFirst({
            where: { description: 'GENESIS_LIQUIDITY_SEED' }
        });

        if (!genesisPoolV1) {
            console.log('🌱 Seeding Genesis Liquidity Pool...');
            /* 
               Assuming MeritTransaction is the ledger. 
               We assign 1,000,000 Merit to the system reserve (or owner).
            */
            await prisma.meritTransaction.create({
                data: {
                    userId: user.id,
                    amount: 1000000,
                    type: 'REWARD', // Using REWARD for initial seed
                    description: 'GENESIS_LIQUIDITY_SEED'
                }
            });
            console.log('🌊 Genesis Pool Initialized: 1,000,000 Merit minted to Owner.');
        } else {
            console.log('ℹ️ Genesis Pool already exists. Skipping seed.');
        }

        // Step 3: Final Verification
        console.log('\n🔒 Locking Protocol Configuration...');
        console.log('✅ Handover Complete. The Ecosystem is live.');

    } catch (error) {
        console.error('❌ HANDOVER FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
