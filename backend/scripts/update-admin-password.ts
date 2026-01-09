import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating Super Admin password...');

    const adminEmail = 'admin@nilelink.app';
    const newPassword = 'DGGASHdggash100%';

    // 1. Find user first
    const user = await prisma.user.findFirst({
        where: { email: adminEmail }
    });

    if (!user) {
        console.error('❌ Super Admin user not found! Ensure seeding ran correctly.');
        process.exit(1);
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update by ID (unique)
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    console.log(`✅ Password updated for ${updatedUser.email} (ID: ${updatedUser.id})`);
}

main()
    .catch((e) => {
        console.error('❌ Failed to update password:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
