import { emailService } from './src/services/EmailService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testTransactionalEmails() {
    const testEmail = 'dggash33@gmail.com';

    console.log('🧪 Testing NileLink Transactional Email System...\n');

    try {
        // 1️⃣ Registration Confirmation
        console.log('1️⃣ Sending Registration Confirmation...');
        await emailService.sendRegistrationConfirmation(
            testEmail,
            'NileLink User',
            'https://nilelink.app/verify?token=v123',
            '24 hours'
        );

        // 2️⃣ Password Reset
        console.log('2️⃣ Sending Password Reset...');
        await emailService.sendPasswordReset(
            testEmail,
            'NileLink User',
            'https://nilelink.app/reset?token=r123',
            '30 minutes'
        );

        // 3️⃣ OTP Code
        console.log('3️⃣ Sending OTP Code...');
        await emailService.sendOtpCode(
            testEmail,
            'NileLink User',
            '882 109',
            '10 minutes'
        );

        // 4️⃣ Order Receipt (POS)
        console.log('4️⃣ Sending Order Receipt...');
        await emailService.sendOrderReceipt(testEmail, {
            orderId: 'NL-8821',
            orderDate: new Date().toLocaleDateString(),
            itemsSummary: '2x Nile Burger - $24.00\n1x Truffle Fries - $8.00\n1x Sparkling Water - $3.50',
            totalAmount: '$35.50',
            paymentMethod: 'Visa **** 4421',
            merchantName: 'NileSide Grill & Bar'
        });

        // 5️⃣ Delivery: Assigned to Driver
        console.log('5️⃣A) Sending Delivery Assigned (Driver)...');
        await emailService.sendOrderAssigned(testEmail, {
            driverName: 'Ahmed Omar',
            orderId: 'NL-8821',
            pickupAddress: 'NileSide Grill, 12 Corniche St.',
            deliveryAddress: '42 Garden City Towers, Flat 12B'
        });

        // 5️⃣ Delivery: Order Delivered (Customer)
        console.log('5️⃣B) Sending Order Delivered (Customer)...');
        await emailService.sendOrderDelivered(testEmail, 'NileLink Customer', 'NL-8821');

        // 6️⃣ Supplier: New Purchase Order
        console.log('6️⃣A) Sending Purchase Order (Supplier)...');
        await emailService.sendPurchaseOrder(testEmail, {
            supplierName: 'Fresh Farms Ltd',
            orderId: 'PO-991',
            itemsSummary: '50kg Organic Tomatoes\n20kg Baby Spinach\n10kg Red Onions',
            deliveryDate: '2025-12-31'
        });

        // 6️⃣ Supplier: Low Stock Alert
        console.log('6️⃣B) Sending Low Stock Alert...');
        await emailService.sendLowStockAlert(testEmail, {
            merchantName: 'NileSide Grill',
            itemName: 'Organic Tomatoes',
            currentStock: 4
        });

        // 7️⃣ Investing: Confirmation
        console.log('7️⃣A) Sending Investment Confirmation...');
        await emailService.sendInvestmentConfirmation(testEmail, {
            investorName: 'Alex Rivera',
            amount: '$5,000.00',
            projectName: 'Cairo Logistics Hub Alpha',
            transactionId: 'INV-772-XY'
        });

        // 7️⃣ Investing: Trade Executed
        console.log('7️⃣B) Sending Trade Executed...');
        await emailService.sendTradeExecuted(testEmail, {
            userName: 'Alex Rivera',
            assetName: 'NILE-DAO Governance Token',
            amount: '1,200 NILE',
            price: '$1.42 / NILE',
            transactionId: 'TRD-441-ZZ'
        });

        console.log('\n🎉 Transactional email test suite completed!');
        console.log(`📧 Check ${testEmail} logs for verification.`);

    } catch (error) {
        console.error('❌ Email test failed:', error);
        process.exit(1);
    }
}

testTransactionalEmails();
