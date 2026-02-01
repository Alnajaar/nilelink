import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/utils/prisma';

/**
 * POS Quick Add Product API
 * Creates global product (if new barcode) and store product in one operation
 * Target time: 3-5 seconds from scan to available in POS
 */
export async function POST(req: NextRequest) {
    try {
        const { barcode, name, category, brand, size, businessId, price, stock, cost, vat, branchId } = await req.json();

        // Validation
        if (!barcode || !name || !category || !businessId || price === undefined || stock === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: barcode, name, category, businessId, price, stock' },
                { status: 400 }
            );
        }

        // Check if global product exists
        let globalProduct = await prisma.globalProduct.findUnique({
            where: { barcode },
        });

        // If not, create it
        if (!globalProduct) {
            globalProduct = await prisma.globalProduct.create({
                data: {
                    barcode,
                    name,
                    category,
                    brand: brand || null,
                    size: size || null,
                    verified: false,
                },
            });
        }

        // Create or update store product
        const storeProduct = await prisma.storeProduct.upsert({
            where: {
                globalProductId_businessId_branchId: {
                    globalProductId: globalProduct.id,
                    businessId,
                    branchId: branchId || null,
                },
            },
            update: {
                price,
                stock: { increment: stock },
                cost: cost || null,
                vat: vat || 0.15,
                lastSyncedAt: new Date(),
                pendingSync: false,
            },
            create: {
                globalProductId: globalProduct.id,
                businessId,
                branchId: branchId || null,
                price,
                stock,
                cost: cost || null,
                vat: vat || 0.15,
                pendingSync: false,
            },
        });

        return NextResponse.json({
            success: true,
            global: globalProduct,
            local: storeProduct,
            message: 'Product added successfully',
        });
    } catch (error: any) {
        console.error('[POS Quick Add Error]', error);

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Barcode already exists in global catalog' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add product' },
            { status: 500 }
        );
    }
}
