import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { currencyService } from '../src/services/CurrencyService';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // 1. Seed Currencies
    console.log('💱 Seeding currencies...');
    await currencyService.seedCurrencies();

    // 2. Update exchange rates
    console.log('📊 Fetching exchange rates...');
    await currencyService.updateExchangeRates();

    // 3. Create Super Admin User (for system-wide management)
    console.log('\n👤 Creating super admin user...');

    const adminEmail = 'admin@nilelink.app';
    const adminPassword = 'Admin@123!'; // Change this in production!

    const existingAdmin = await prisma.user.findFirst({
        where: {
            email: adminEmail,
        }
    });

    if (!existingAdmin) {
        // Create a system tenant for admin
        const systemTenant = await prisma.tenant.upsert({
            where: { subdomain: 'system' },
            create: {
                name: 'System',
                subdomain: 'system',
                plan: 'ENTERPRISE',
                trialEndsAt: new Date('2099-12-31'),
                isActive: true,
            },
            update: {}
        });

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await prisma.user.create({
            data: {
                tenantId: systemTenant.id,
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                isVerified: true,
                isActive: true,
            }
        });

        console.log(`✅ Super Admin created: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!`);
    } else {
        console.log('✓ Super admin already exists');
    }

    // 4. Create demo tenant with sample data
    console.log('\n🏢 Creating demo tenant...');

    const demoTenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo' },
        create: {
            name: 'Demo Restaurant Group',
            subdomain: 'demo',
            plan: 'TRIAL',
            trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            isActive: true,
            settings: {
                create: {
                    baseCurrency: 'USD',
                    timezone: 'America/New_York',
                    dateFormat: 'MM/DD/YYYY',
                    taxRate: 0.08,
                    enableInventory: true,
                    enableDelivery: true,
                }
            }
        },
        update: {}
    });

    console.log(`✅ Demo tenant created: demo.nilelink.app`);

    // Import role seeder
    const { seedTenantRoles } = require('../src/services/RoleSeeder');

    // 5. Seed roles for demo tenant
    console.log('\n🎭 Seeding roles for demo tenant...');
    try {
        await seedTenantRoles(demoTenant.id);
    } catch (error) {
        console.log('✓ Roles already seeded');
    }

    // 6. Create demo restaurant
    console.log('\n🍽️  Creating demo restaurant...');

    const demoRestaurant = await prisma.restaurant.upsert({
        where: { id: 'demo-restaurant-1' },
        create: {
            id: 'demo-restaurant-1',
            tenantId: demoTenant.id,
            name: 'Cairo Street Kitchen',
            description: 'Authentic Egyptian street food',
            address: '123 Zamalek St, Cairo, Egypt',
            phone: '+20 2 1234 5678',
            email: 'info@cairostreet.demo',
            latitude: 30.0444,
            longitude: 31.2357,
            isActive: true,
        },
        update: {}
    });

    console.log(`✅ Demo restaurant created: ${demoRestaurant.name}`);

    // 7. Create demo menu items
    console.log('\n📋 Creating demo menu items...');

    const menuItems = [
        { name: 'Koshary', category: 'Main Dishes', price: 8.99, description: 'Traditional Egyptian rice, lentils, and pasta' },
        { name: 'Falafel Wrap', category: 'Sandwiches', price: 5.99, description: 'Crispy falafel with tahini sauce' },
        { name: 'Shawarma Plate', category: 'Main Dishes', price: 12.99, description: 'Chicken shawarma with rice and salad' },
        { name: 'Mint Lemonade', category: 'Beverages', price: 3.50, description: 'Fresh mint and lemon drink' },
        { name: 'Baklava', category: 'Desserts', price: 4.50, description: 'Sweet pastry with honey and nuts' },
    ];

    for (const item of menuItems) {
        await prisma.menuItem.upsert({
            where: {
                id: `demo-${item.name.toLowerCase().replace(/\s/g, '-')}`
            },
            create: {
                id: `demo-${item.name.toLowerCase().replace(/\s/g, '-')}`,
                restaurantId: demoRestaurant.id,
                ...item,
                isAvailable: true,
                preparationTime: 15,
            },
            update: {}
        });
    }

    console.log(`✅ Created ${menuItems.length} demo menu items`);

    // 8. Create demo owner user
    console.log('\n👤 Creating demo owner user...');

    const ownerEmail = 'owner@demo.nilelink.app';
    const ownerPassword = 'Demo@123!';

    const existingOwner = await prisma.user.findFirst({
        where: {
            email: ownerEmail,
            tenantId: demoTenant.id,
        }
    });

    if (!existingOwner) {
        const ownerRole = await prisma.role.findFirst({
            where: {
                tenantId: demoTenant.id,
                name: 'Owner'
            }
        });

        const hashedOwnerPassword = await bcrypt.hash(ownerPassword, 10);

        await prisma.user.create({
            data: {
                tenantId: demoTenant.id,
                email: ownerEmail,
                password: hashedOwnerPassword,
                firstName: 'Demo',
                lastName: 'Owner',
                isVerified: true,
                isActive: true,
                roles: {
                    connect: { id: ownerRole!.id }
                }
            }
        });

        console.log(`✅ Demo owner created: ${ownerEmail}`);
        console.log(`   Password: ${ownerPassword}`);
    } else {
        console.log('✓ Demo owner already exists');
    }

    console.log('\n✅ Database seeding completed!\n');
    console.log('🚀 Quick Start:');
    console.log('   - Super Admin: admin@nilelink.app / Admin@123!');
    console.log('   - Demo Tenant: https://demo.nilelink.app');
    console.log('   - Demo Owner: owner@demo.nilelink.app / Demo@123!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
