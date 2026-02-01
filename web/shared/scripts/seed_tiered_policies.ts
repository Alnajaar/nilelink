import { prisma } from '../utils/prisma';

async function seedTieredPolicies() {
    console.log('--- SEEDING TIERED GAS POLICIES ---');

    const policies = [
        {
            name: 'Small Merchant Policy',
            merchantTier: 'SMALL',
            role: 'MERCHANT',
            dailyLimitUsd6: 500000, // $0.50
            description: 'Dynamic sponsorship for starting merchants'
        },
        {
            name: 'Medium Merchant Policy',
            merchantTier: 'MEDIUM',
            role: 'MERCHANT',
            dailyLimitUsd6: 1000000, // $1.00
            description: 'Standard growth package for scaling businesses'
        },
        {
            name: 'Large Merchant Policy',
            merchantTier: 'LARGE',
            role: 'MERCHANT',
            dailyLimitUsd6: 3000000, // $3.00
            description: 'High-volume institutional synchronization'
        },
        {
            name: 'Provider / Supplier Standard',
            role: 'SUPPLIER',
            dailyLimitUsd6: 1000000, // $1.00
            description: 'Baseline sponsorship for supply chain nodes'
        }
    ];

    for (const p of policies) {
        await prisma.gasPolicy.upsert({
            where: { name: p.name },
            update: p,
            create: p
        });
        console.log(`- Upserted: ${p.name} ($${p.dailyLimitUsd6 / 1000000})`);
    }

    console.log('--- SEEDING COMPLETE ---');
}

if (require.main === module) {
    seedTieredPolicies().then(() => prisma.$disconnect());
}
