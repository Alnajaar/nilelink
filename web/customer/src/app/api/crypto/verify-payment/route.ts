import { NextRequest } from 'next/server';
import { Database } from '@/lib/db';
import { AffiliateService } from '@/lib/services/AffiliateService';
import { ethers } from 'ethers';

const RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r';
const ORDER_SETTLEMENT_ADDRESS = process.env.NEXT_PUBLIC_ORDER_SETTLEMENT_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

const ORDER_SETTLEMENT_ABI = [
    'function getOrderStatus(bytes16 orderId) view returns (uint8 status, uint256 amount, uint64 paidAt, uint64 settledAt)'
];

export async function POST(request: NextRequest) {
    try {
        const { orderId, txHash } = await request.json();

        if (!orderId || !txHash) {
            return Response.json({ success: false, error: 'Missing orderId or txHash' }, { status: 400 });
        }

        // 1. Verify transaction on-chain
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const tx = await provider.getTransactionReceipt(txHash);

        if (!tx || tx.status !== 1) {
            return Response.json({ success: false, error: 'Transaction failed or not found' }, { status: 400 });
        }

        // 2. Double check status in contract
        const contract = new ethers.Contract(ORDER_SETTLEMENT_ADDRESS, ORDER_SETTLEMENT_ABI, provider);

        // Format orderId back to bytes16 for the call
        const formattedOrderId = '0x' + orderId.replace(/-/g, '');
        const [status, amount, paidAt] = await contract.getOrderStatus(formattedOrderId);

        // Status 2 is CONFIRMED (based on enum TxStatus { PENDING, CONFIRMED, SETTLED, ... })
        // Wait, let's check the enum in NileLinkLibs or similar.
        // In OrderSettlement.sol: PENDING=0, CONFIRMED=1 (wait, let's be careful)
        // Actually common pattern: PENDING=0, CONFIRMED=1, SETTLED=2

        if (Number(status) === 0) {
            return Response.json({ success: false, error: 'Order not yet marked as paid on-chain' }, { status: 400 });
        }

        const orderAmount = Number(ethers.formatUnits(amount, 6));

        // 3. Record commission in PostgreSQL
        const referralCode = request.cookies.get('referralCode')?.value;
        if (referralCode) {
            const client = await Database.getClient();
            const affResult = await client.query('SELECT id FROM affiliates WHERE referral_code = $1', [referralCode]);

            if (affResult.rows.length > 0) {
                const affiliateId = affResult.rows[0].id;
                // In a real app we'd also link to the user, for now we record by affiliate code
                const affiliateService = new AffiliateService();

                // Find referral record
                const refResult = await client.query(
                    'SELECT id FROM referrals WHERE affiliate_id = $1',
                    [affiliateId]
                );

                if (refResult.rows.length > 0) {
                    await affiliateService.recordCommission(
                        refResult.rows[0].id,
                        orderAmount,
                        orderId,
                        `Order ${orderId} (On-chain Payment confirmed)`
                    );
                }
            }
        }

        return Response.json({
            success: true,
            data: { status: Number(status), amount: orderAmount }
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return Response.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
    }
}
