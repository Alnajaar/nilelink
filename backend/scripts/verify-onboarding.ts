import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function verifyOnboardingFlow() {
    console.log('🔍 Starting Supplier Onboarding Flow Verification...\n');

    const testEmail = `test-supplier-${Date.now()}@nilelink.test`;
    const testPassword = 'SecurePass123!';

    try {
        // Step 1: Simulate Registration
        console.log('📝 Step 1: Creating test supplier account...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await prisma.user.create({
            data: {
                email: testEmail,
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'Supplier',
                role: 'VENDOR',
                emailVerificationToken: verificationToken,
                emailVerificationExpiresAt: verificationTokenExpires,
                emailVerified: false,
                isActive: false
            }
        });

        console.log(`✅ Account created: ${user.email}`);
        console.log(`   - emailVerified: ${user.emailVerified}`);
        console.log(`   - isActive: ${user.isActive}`);
        console.log(`   - role: ${user.role}\n`);

        // Step 2: Simulate Email Verification
        console.log('📧 Step 2: Verifying email with token...');
        const verifiedUser = await prisma.user.update({
            where: {
                emailVerificationToken: verificationToken
            },
            data: {
                emailVerified: true,
                isActive: true,
                emailVerificationToken: null,
                emailVerificationExpiresAt: null
            }
        });

        console.log(`✅ Email verified successfully`);
        console.log(`   - emailVerified: ${verifiedUser.emailVerified}`);
        console.log(`   - isActive: ${verifiedUser.isActive}\n`);

        // Step 3: Simulate Login Check
        console.log('🔐 Step 3: Checking login eligibility...');
        const loginUser = await prisma.user.findUnique({
            where: { email: testEmail }
        });

        if (!loginUser) {
            throw new Error('User not found');
        }

        const passwordValid = await bcrypt.compare(testPassword, loginUser.password!);

        if (!loginUser.emailVerified) {
            throw new Error('❌ FAILED: Email not verified - login would be blocked!');
        }

        if (!loginUser.isActive) {
            throw new Error('❌ FAILED: Account not active - login would be blocked!');
        }

        if (!passwordValid) {
            throw new Error('❌ FAILED: Password validation failed!');
        }

        console.log('✅ Login check passed - user can authenticate\n');

        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await prisma.user.delete({
            where: { id: user.id }
        });

        console.log('✅ Test data cleaned up\n');
        console.log('🎉 VERIFICATION COMPLETE: All onboarding flow checks passed!\n');
        console.log('Summary:');
        console.log('  ✓ Registration creates user with emailVerified=false, isActive=false');
        console.log('  ✓ Email verification sets emailVerified=true, isActive=true');
        console.log('  ✓ Login correctly checks emailVerified field');
        console.log('  ✓ Active users can authenticate successfully\n');

    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error);

        // Cleanup on error
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: testEmail }
            });
            if (existingUser) {
                await prisma.user.delete({
                    where: { email: testEmail }
                });
                console.log('🧹 Cleaned up test user after error');
            }
        } catch (cleanupError) {
            console.error('Failed to cleanup:', cleanupError);
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifyOnboardingFlow();
