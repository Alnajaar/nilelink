
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { BlockchainService } from '../src/services/BlockchainService';

// Mock Provider using Hardhat Local (or just simulating events)
// Since we can't spin up a full node easily in this env, we will:
// 1. Manually insert an Order into DB.
// 2. Call the 'handlePaymentReceived' method of BlockchainService directly 
//    (simulating that the listener picked it up).
// 3. Verify DB state changed.

const prisma = new PrismaClient();
const service = new BlockchainService();

async function main() {
    console.log("🚀 Starting Bridge Verification in Simulation Mode...");

    // 1. Create a Test Order
    const orderNumber = `TEST-${Date.now()}`;
    const uuid = '11111111-1111-1111-1111-111111111111'; // Static UUID for test

    // Cleanup first
    try {
        await prisma.payment.deleteMany({ where: { orderId: uuid } });
        await prisma.order.delete({ where: { id: uuid } });
    } catch { }

    console.log("📝 Creating Test Order in DB...");
    // Use 'any' cast if types are too strict for this script environment (quick fix)
    // or properly structure. 'items: { create: [] }' is correct for Prisma.
    const orderData: any = {
        id: uuid,
        orderNumber: orderNumber,
        totalAmount: 50.00,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: { create: [] }, // Correct relation syntax
        currency: 'USD',
        type: 'DINE_IN',
        subtotal: 50.00,
        tax: 0,
        serviceCharge: 0, // Corrected typo
        tenantId: 'default',
        restaurantId: 'default-rest',
    };

    const order = await prisma.order.create({
        data: orderData
    });

    console.log(`✅ Order Created: ${order.orderNumber} (Amount: $50.00)`);

    // 2. Simulate Blockchain Event
    // We want to simulate that user paid 50 USDC
    const txHash = '0x' + '1'.repeat(64); // Fake hash
    const amountUsd6 = BigInt(50 * 1000000); // 50 USDC
    const payer = '0x' + '2'.repeat(40);
    const timestamp = BigInt(Date.now());

    // Construct a fake event object
    const mockEvent: any = {
        transactionHash: txHash,
        blockNumber: 1,
    };

    // Encode orderNumber as bytes32 string (simulating what contract sends)
    // Contract sends bytes16. If our logic expects bytes32 padded.
    // In service: output = ethers.decodeBytes32String(ethers.zeroPadValue(orderIdBytes, 32))

    // So input should be orderNumber string encoded to bytes. 
    // And if it's passed as bytes16 in Solidity, we need to mimic that.
    // We'll mimic the bytes argument passed to handler.
    const bytes32 = ethers.encodeBytes32String(orderNumber);
    // If we assume logic slices it or handles it. Service uses zeroPadValue so it handles short bytes.
    // We pass bytes32 string directly.

    console.log("🔗 Simulating 'PaymentReceived' Event...");

    // We must access the private method or make it public/internal for test.
    // Since it's private, we can cast to any or use a public wrapper if we had one.
    // For this verification script, let's treat it as a unit test and access via ANY.
    await (service as any).handlePaymentReceived(
        bytes32,
        payer,
        amountUsd6,
        timestamp,
        mockEvent
    );

    // 3. Verify DB State
    const updatedOrder = await prisma.order.findUnique({ where: { id: uuid } });
    const payment = await prisma.payment.findUnique({ where: { transactionId: txHash } });

    console.log("🔍 Verifying State...");

    // Check specific fields
    if (updatedOrder?.paymentStatus === 'COMPLETED' && payment) {
        console.log("✅ SUCCESS: Order marked COMPLETED and Payment recorded!");
        console.log(`   Order Status: ${updatedOrder.status}`);
        console.log(`   Payment ID: ${payment.id}`);
    } else {
        console.error("❌ FAILURE: State did not update correctly.");
        console.log("Updated Order Status:", updatedOrder?.paymentStatus);
        console.log("Payment Found:", !!payment);
        process.exit(1);
    }

    // 4. Test Underpayment (Strict Check)
    console.log("\n🧪 Testing Underpayment Logic...");
    const uuid2 = '22222222-2222-2222-2222-222222222222';
    try {
        await prisma.payment.deleteMany({ where: { orderId: uuid2 } });
        await prisma.order.delete({ where: { id: uuid2 } });
    } catch { }

    const badOrderData: any = {
        id: uuid2,
        orderNumber: orderNumber + '-BAD',
        totalAmount: 100.00,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: { create: [] },
        currency: 'USD',
        type: 'DINE_IN',
        subtotal: 100.00,
        tax: 0,
        serviceCharge: 0,
        tenantId: 'default',
        restaurantId: 'default-rest',
    };

    await prisma.order.create({
        data: badOrderData
    });


    const txHash2 = '0x' + '3'.repeat(64);
    const amountUnder = BigInt(10 * 1000000); // 10 USDC (Expected 100)

    const mockEvent2: any = { transactionHash: txHash2, blockNumber: 2 };
    const bytes32Bad = ethers.encodeBytes32String(orderNumber + '-BAD');

    await (service as any).handlePaymentReceived(
        bytes32Bad,
        payer,
        amountUnder,
        timestamp,
        mockEvent2
    );

    const badOrder = await prisma.order.findUnique({ where: { id: uuid2 } });
    if (badOrder?.paymentStatus === 'FAILED') { // or whatever we set in service (FAILED/PARTIAL)
        console.log("✅ SUCCESS: Underpayment detected and flagged!");
        console.log(`   Order Status: ${badOrder.status} (Should be PENDING)`);
        console.log(`   Payment Status: ${badOrder.paymentStatus}`);
    } else {
        console.error("❌ FAILURE: Underpayment NOT detected.");
        console.log("Order:", badOrder);
    }

    console.log("\n🎉 Verification Suite Complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
