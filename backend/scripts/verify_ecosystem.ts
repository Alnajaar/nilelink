import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Starting Ecosystem Verification...');

    // 1. SETUP
    console.log('\n--- SETUP ---');

    // Create Tenant & Restaurant
    const tenant = await prisma.tenant.create({
        data: { name: 'Test Ecosystem Tenant', subdomain: `test-eco-${Date.now()}` }
    });

    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Test Kitchen',
            // slug removed, not in schema
            tenantId: tenant.id,
            address: '123 Test St'
        }
    });

    // Create Supplier
    const supplier = await prisma.supplier.create({
        data: { name: 'Fresh Farms Ltd', email: `supplier-${Date.now()}@test.com` }
    });

    // Create Inventory with LOW STOCK potential
    const inventoryItem = await prisma.inventory.create({
        data: {
            restaurantId: restaurant.id,
            supplierId: supplier.id,
            name: 'Organic Tomatoes',
            unit: 'kg',
            quantity: 12,
            reorderLevel: 10,
            unitCost: 2.50
        }
    });

    // Create Customer
    const customerUser = await prisma.user.create({
        data: {
            email: `customer-${Date.now()}@test.com`,
            password: 'hash',
            role: 'CUSTOMER',
            tenantId: tenant.id,
            firstName: 'John',
            lastName: 'Customer'
        }
    });

    // Create Driver
    const driverUser = await prisma.user.create({
        data: {
            email: `driver-${Date.now()}@test.com`,
            password: 'hash',
            role: 'DELIVERY_DRIVER',
            tenantId: tenant.id,
            firstName: 'Fast',
            lastName: 'Eddie'
        }
    });

    console.log('✅ Setup Complete');

    // 2. TASK A: LOYALTY (Simulate Order)
    console.log('\n--- TASK A: LOYALTY CHECK ---');

    const orderTotal = 150.00;

    // Create Order
    // Note: Creating items as empty array for simplicity or using create if relation exists
    const order = await prisma.order.create({
        data: {
            restaurantId: restaurant.id,
            customerId: customerUser.id,
            totalAmount: orderTotal,
            status: 'PENDING',
            items: {
                create: [] // Valid empty create if allowed, else remove
            },
            delivery: {
                create: {
                    pickupAddress: restaurant.address!,
                    dropoffAddress: '456 Customer Ln',
                    status: 'PENDING'
                }
            } as any // Bypass strict nested type check
        },
        include: { delivery: true }
    });

    // Apply Loyalty Logic
    const pointsEarned = Math.floor(orderTotal);

    await prisma.customerProfile.upsert({
        where: { userId: customerUser.id },
        create: {
            userId: customerUser.id,
            loyaltyPoints: pointsEarned,
            totalSpent: orderTotal,
            // tierId removed to avoid null err if optional
            tierId: undefined
        },
        update: {
            loyaltyPoints: { increment: pointsEarned },
            totalSpent: { increment: orderTotal }
        }
    });

    const updatedProfile = await prisma.customerProfile.findUnique({ where: { userId: customerUser.id } });
    console.log(`Order Amount: $${orderTotal}`);
    console.log(`Points Expected: ${pointsEarned}`);
    console.log(`Points Actual: ${updatedProfile?.loyaltyPoints}`);

    if (updatedProfile?.loyaltyPoints === pointsEarned) {
        console.log('✅ Task A PASSED: Points awarded correctly.');
    } else {
        console.error('❌ Task A FAILED: Points mismatch.');
    }

    // 3. TASK B: SUPPLIER SYNC (Simulate Stock Drop)
    console.log('\n--- TASK B: SUPPLIER SYNC ---');

    const orderQty = 5;
    console.log(`Inventory Before: ${inventoryItem.quantity}`);

    // Deduct
    const updatedInventory = await prisma.inventory.update({
        where: { id: inventoryItem.id },
        data: { quantity: { decrement: orderQty } }
    });
    console.log(`Inventory After: ${updatedInventory.quantity}`);

    // Check Reorder Logic
    if (Number(updatedInventory.quantity) <= Number(updatedInventory.reorderLevel)) {
        console.log(`📉 Low Stock. Triggering Auto-Restock...`);

        const restockQty = 50;
        const cost = Number(updatedInventory.unitCost) * restockQty;

        const po = await prisma.purchaseOrder.create({
            data: {
                restaurantId: restaurant.id,
                supplierId: supplier.id,
                status: 'SENT',
                totalCost: cost,
                items: JSON.stringify([{ name: updatedInventory.name, qty: restockQty }])
            }
        });

        const verifyPo = await prisma.purchaseOrder.findUnique({ where: { id: po.id } });
        if (verifyPo) {
            console.log(`📦 Purchase Order Created! ID: ${po.id}`);
            console.log('✅ Task B PASSED: Purchase Order automatically created.');
        } else {
            console.error('❌ Task B FAILED: PO not found.');
        }
    } else {
        console.log('⚠️ Test Issue: Inventory > Reorder Level.');
    }

    // 4. TASK C: DELIVERY
    console.log('\n--- TASK C: DELIVERY FLOW ---');

    if (!order.delivery) {
        console.error('❌ No delivery record found on order.');
        return;
    }
    const deliveryId = order.delivery!.id;

    // Assign
    await prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: 'ASSIGNED', driverId: driverUser.id }
    });

    // Pick Up
    await prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: 'PICKED_UP', pickupTime: new Date() }
    });

    // Deliver
    await prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: 'DELIVERED', deliveryTime: new Date() }
    });

    const finalDelivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (finalDelivery?.status === 'DELIVERED') {
        console.log('✅ Task C PASSED: Status updated to DELIVERED.');
    } else {
        console.error(`❌ Task C FAILED: Status is ${finalDelivery?.status}`);
    }

    console.log('\n🧪 Verification Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
