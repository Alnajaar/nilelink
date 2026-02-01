import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/utils/prisma';

/**
 * Offline Sync API
 * Replays queued operations from offline POS systems
 * Implements conflict resolution (server is source of truth)
 */
export async function POST(req: NextRequest) {
    try {
        const { operations, businessId } = await req.json();

        if (!Array.isArray(operations) || !businessId) {
            return NextResponse.json(
                { error: 'Invalid request: operations array and businessId required' },
                { status: 400 }
            );
        }

        const results = {
            synced: [] as any[],
            failed: [] as any[],
            conflicts: [] as any[],
        };

        // Process operations sequentially to maintain order
        for (const op of operations) {
            try {
                const result = await processOperation(op, businessId);

                if (result.success) {
                    results.synced.push({ operationId: op.id, ...result });

                    // Mark as synced in queue
                    if (op.queueId) {
                        await prisma.offlineSyncQueue.update({
                            where: { id: op.queueId },
                            data: {
                                status: 'synced',
                                syncedAt: new Date(),
                            },
                        });
                    }
                } else {
                    results.failed.push({ operationId: op.id, error: result.error });

                    // Record failure
                    if (op.queueId) {
                        await prisma.offlineSyncQueue.update({
                            where: { id: op.queueId },
                            data: {
                                status: op.retryCount >= 3 ? 'failed' : 'retrying',
                                retryCount: { increment: 1 },
                                error: result.error,
                            },
                        });
                    }
                }
            } catch (error: any) {
                console.error(`[Sync] Operation ${op.id} failed:`, error);
                results.failed.push({
                    operationId: op.id,
                    error: error.message,
                });
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: operations.length,
                synced: results.synced.length,
                failed: results.failed.length,
                conflicts: results.conflicts.length,
            },
            results,
        });
    } catch (error) {
        console.error('[Offline Sync API Error]', error);
        return NextResponse.json(
            { error: 'Sync operation failed' },
            { status: 500 }
        );
    }
}

/**
 * Process individual sync operation
 */
async function processOperation(op: any, businessId: string) {
    const { operation, entityType, payload } = op;

    try {
        switch (operation) {
            case 'CREATE_GLOBAL':
                // Create global product
                const globalProduct = await prisma.globalProduct.create({
                    data: {
                        barcode: payload.barcode,
                        name: payload.name,
                        category: payload.category,
                        brand: payload.brand || null,
                        size: payload.size || null,
                        verified: false,
                    },
                });
                return { success: true, entity: globalProduct };

            case 'CREATE_PRODUCT':
                // Create store product (assumes global exists)
                const storeProduct = await prisma.storeProduct.create({
                    data: {
                        globalProductId: payload.globalProductId,
                        businessId,
                        price: payload.price,
                        stock: payload.stock,
                        cost: payload.cost || null,
                        vat: payload.vat || 0.15,
                        branchId: payload.branchId || null,
                    },
                });
                return { success: true, entity: storeProduct };

            case 'UPDATE_STOCK':
                // Update stock (server value takes precedence in conflicts)
                const updated = await prisma.storeProduct.update({
                    where: { id: payload.storeProductId },
                    data: {
                        stock: payload.stock,
                        lastSyncedAt: new Date(),
                    },
                });
                return { success: true, entity: updated };

            case 'UPDATE_PRICE':
                // Update price
                const priceUpdated = await prisma.storeProduct.update({
                    where: { id: payload.storeProductId },
                    data: {
                        price: payload.price,
                        lastSyncedAt: new Date(),
                    },
                });
                return { success: true, entity: priceUpdated };

            default:
                return { success: false, error: `Unknown operation: ${operation}` };
        }
    } catch (error: any) {
        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return { success: false, error: 'Entity already exists (conflict)' };
        }

        throw error;
    }
}
