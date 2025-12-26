
import { PrismaClient, UserRole, StaffRole, AccountType, AccountCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Cleanup existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.restaurantProfile.deleteMany();
    await prisma.staffProfile.deleteMany();
    await prisma.customerProfile.deleteMany();
    await prisma.investorProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.account.deleteMany();

    console.log('🧹 Cleaned up existing data');

    // 2. Create Chart of Accounts (Double Entry Ledger)
    const accounts = [
        { code: '1000', name: 'Cash on Hand', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET },
        { code: '1010', name: 'Bank Account - Cairo Bank', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET },
        { code: '1200', name: 'Accounts Receivable', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET },
        { code: '1300', name: 'Inventory Asset', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET },
        { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, category: AccountCategory.CURRENT_LIABILITY },
        { code: '3000', name: 'Owner Equity', type: AccountType.EQUITY, category: AccountCategory.OWNER_EQUITY },
        { code: '4000', name: 'Sales Revenue', type: AccountType.INCOME, category: AccountCategory.OPERATING_INCOME },
        { code: '5000', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE },
        { code: '5100', name: 'Rent Expense', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE },
    ];

    for (const acc of accounts) {
        await prisma.account.create({ data: acc });
    }
    console.log('✅ Created Chart of Accounts');

    // 3. Create Users
    const password = await bcrypt.hash('password123', 10);

    // Admin / Owner
    const owner = await prisma.user.create({
        data: {
            email: 'owner@nilelink.app',
            password,
            firstName: 'Omar',
            lastName: 'Owner',
            role: UserRole.RESTAURANT_OWNER,
            isVerified: true
        }
    });

    // Manager
    const manager = await prisma.user.create({
        data: {
            email: 'manager@nilelink.app',
            password,
            firstName: 'Mona',
            lastName: 'Manager',
            role: UserRole.RESTAURANT_STAFF,
            isVerified: true
        }
    });

    // Driver
    const driver = await prisma.user.create({
        data: {
            email: 'driver@nilelink.app',
            password,
            firstName: 'Karim',
            lastName: 'Driver',
            phone: '+20123456789',
            role: UserRole.DELIVERY_DRIVER,
            isVerified: true
        }
    });

    // Customer
    const customer = await prisma.user.create({
        data: {
            email: 'customer@nilelink.app',
            password,
            firstName: 'Ali',
            lastName: 'Customer',
            role: UserRole.CUSTOMER,
            isVerified: true,
            customerProfile: {
                create: {
                    loyaltyPoints: 150
                }
            }
        }
    });

    // Investor
    const investor = await prisma.user.create({
        data: {
            email: 'investor@nilelink.app',
            password,
            firstName: 'Sarah',
            lastName: 'Investor',
            role: UserRole.INVESTOR,
            isVerified: true,
            investorProfile: {
                create: {
                    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                    totalInvested: 50000,
                    kycStatus: "APPROVED"
                }
            }
        }
    });

    console.log('✅ Created Users');

    // 4. Create Restaurant
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Grand Cairo Grill',
            description: 'Authentic Egyptian Grills & Mezza',
            address: '12 Nile Corniche, Zamalek, Cairo',
            phone: '+20 2 2735 0000',
            email: 'info@grandcairo.com',
            isActive: true,
            staff: {
                create: [
                    { userId: owner.id, role: StaffRole.OWNER, permissions: {} },
                ]
            },
            staffMembers: {
                create: [
                    { userId: manager.id, role: StaffRole.MANAGER },
                ]
            }
        }
    });
    console.log('✅ Created Restaurant: Grand Cairo Grill');

    // 5. Create Menu Items
    const menuItems = [
        { name: 'Mixed Grill Platter', price: 250, category: 'Grills', description: 'Shish Tawook, Kofta, Kebab' },
        { name: 'Lamb Kofta', price: 180, category: 'Grills', description: 'Spiced minced lamb grilled to perfection' },
        { name: 'Falafel Wrap', price: 45, category: 'Sandwiches', description: 'Crispy falafel with tahini' },
        { name: 'Hawawshi', price: 85, category: 'Sandwiches', description: 'Spiced meat stuffed in baladi bread' },
        { name: 'Koshary', price: 60, category: 'Main Dishes', description: 'Rice, pasta, lentils with tomato sauce' },
        { name: 'Mint Lemonade', price: 35, category: 'Drinks', description: 'Freshly squeezed with mint leaves' },
        { name: 'Hibiscus Tea', price: 30, category: 'Drinks', description: 'Cold brewed karkade' },
    ];

    for (const item of menuItems) {
        await prisma.menuItem.create({
            data: {
                restaurantId: restaurant.id,
                ...item,
            }
        });
    }
    console.log('✅ Created Menu Items');

    // 6. Create Supplier & Inventory
    const supplier = await prisma.supplier.create({
        data: {
            name: 'Green Valley Farms',
            email: 'orders@greenvalley.eg',
            phone: '+20 100 111 2222',
            address: 'Giza Agriculture Rd'
        }
    });

    const inventoryItems = [
        { itemName: 'Tomatoes', unit: 'kg', currentStock: 50, cost: 10 },
        { itemName: 'Onions', unit: 'kg', currentStock: 100, cost: 8 },
        { itemName: 'Lamb Meat', unit: 'kg', currentStock: 25, cost: 250 },
        { itemName: 'Chicken Breast', unit: 'kg', currentStock: 40, cost: 160 },
    ];

    for (const inv of inventoryItems) {
        await prisma.inventory.create({
            data: {
                restaurantId: restaurant.id,
                supplierId: supplier.id,
                itemId: `SKU-${Math.floor(Math.random() * 10000)}`,
                category: 'Raw Material',
                itemName: inv.itemName,
                unit: inv.unit,
                currentStock: inv.currentStock,
                unitCost: inv.cost
            }
        });
    }
    console.log('✅ Created Supplier & Inventory');

    console.log('🌱 Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
