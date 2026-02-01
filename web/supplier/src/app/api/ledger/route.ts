import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const supplierId = searchParams.get('supplierId');

        if (!supplierId) {
            return Response.json({ error: 'supplierId is required' }, { status: 400 });
        }

        // Get Supplier Profile ID from User ID
        const supplier = await prisma.supplierProfile.findUnique({
            where: { userId: supplierId }
        });

        if (!supplier) {
            return Response.json({ credits: [], events: [] });
        }

        // Fetch B2B Accounts (Credits)
        const accounts = await prisma.b2BAccount.findMany({
            where: { supplierId: supplier.id },
            include: {
                events: {
                    take: 10,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        // Fetch recent events across all accounts for this supplier
        const recentEvents = await prisma.b2BEvent.findMany({
            where: {
                account: {
                    supplierId: supplier.id
                }
            },
            take: 50,
            orderBy: { timestamp: 'desc' },
            include: {
                account: true
            }
        });

        return Response.json({
            credits: accounts,
            events: recentEvents
        });
    } catch (error) {
        console.error('[API Ledger] GET Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { supplierId, merchantId, merchantName, type, amount, description } = data;

        if (!supplierId || !merchantId) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get/Create Supplier Profile
        let supplier = await prisma.supplierProfile.findUnique({
            where: { userId: supplierId }
        });

        if (!supplier) {
            supplier = await prisma.supplierProfile.create({
                data: {
                    userId: supplierId,
                    companyName: 'B2B Partner',
                    status: 'VERIFIED'
                }
            });
        }

        // 2. Get/Create B2B Account
        let account = await prisma.b2BAccount.findUnique({
            where: {
                supplierId_merchantId: {
                    supplierId: supplier.id,
                    merchantId: merchantId
                }
            }
        });

        if (!account) {
            account = await prisma.b2BAccount.create({
                data: {
                    supplierId: supplier.id,
                    merchantId: merchantId,
                    merchantName: merchantName || `Business ${merchantId.slice(0, 6)}`,
                    creditLimit: 5000 // Default limit for new accounts
                }
            });
        }

        // 3. Update Balance and Record Event
        const updatedAccount = await prisma.$transaction(async (tx) => {
            // Create Event
            await tx.b2BEvent.create({
                data: {
                    accountId: account!.id,
                    type: type || 'DEBT_ADJUSTED',
                    amount: parseFloat(amount || '0'),
                    description: description || ''
                }
            });

            // Update Balance
            return await tx.b2BAccount.update({
                where: { id: account!.id },
                data: {
                    balance: {
                        increment: parseFloat(amount || '0')
                    },
                    lastPaymentAt: type === 'PAYMENT_RECEIVED' ? new Date() : undefined,
                    // Simple risk scoring
                    riskLevel: (account!.balance + parseFloat(amount || '0')) > account!.creditLimit ? 'CRITICAL' : 'LOW'
                }
            });
        });

        return Response.json({ success: true, account: updatedAccount });

    } catch (error) {
        console.error('[API Ledger] POST Error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
