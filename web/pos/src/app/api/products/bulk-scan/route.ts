import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/utils/prisma';

/**
 * POS Bulk Scan API
 * Continuous scanning mode for night stocking
 * Each scan increments stock by +1
 * Auto-creates product if missing (price can be added later)
 */
export async function POST(req: NextRequest) {
    try {
        const { barcode, businessId, branchId } = await req.json();

        if (!barcode || !businessId) {
            return NextResponse.json(
                { error: 'Barcode and businessId are required' },
                { status: 400 }
            );
        }

        // Check global catalog
        let globalProduct = await prisma.globalProduct.findUnique({
            where: { barcode },
        });

        // If product doesn't exist in global catalog, create placeholder
        if (!globalProduct) {
            globalProduct = await prisma.globalProduct.create({
                data: {
                    barcode,
                    name: `Product ${barcode}`, // Placeholder name
                    category: 'UNCATEGORIZED',
                    verified: false,
                },
            });
        }

        // Find or create store product
        const storeProduct = await prisma.storeProduct.upsert({
            where: {
                globalProductId_businessId_branchId: {
                    globalProductId: globalProduct.id,
                    businessId,
                    branchId: branchId || null,
                },
            },
            update: {
                stock: { increment: 1 },
                lastSyncedAt: new Date(),
            },
            create: {
                globalProductId: globalProduct.id,
                businessId,
                branchId: branchId || null,
                price: 0, // Placeholder price (to be set later)
                stock: 1,
                vat: 0.15,
            },
        });

        return NextResponse.json({
            success: true,
            product: {
                ...globalProduct,
                localStock: storeProduct.stock,
                localPrice: storeProduct.price,
            },
            message: storeProduct.price === 0
                ? 'Product scanned. Please set price later.'
                : 'Stock updated',
        });
    } catch (error) {
        console.error('[POS Bulk Scan Error]', error);
        return NextResponse.json(
            { error: 'Failed to process bulk scan' },
            { status: 500 }
        );
    }
}
