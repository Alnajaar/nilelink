import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@shared/utils/prisma';

/**
 * POS Product Search API
 * Searches global catalog and returns both global product data and local store pricing
 */
export async function POST(req: NextRequest) {
    try {
        const { barcode, businessId } = await req.json();

        if (!barcode || !businessId) {
            return NextResponse.json(
                { error: 'Barcode and businessId are required' },
                { status: 400 }
            );
        }

        // Search global catalog
        const globalProduct = await prisma.globalProduct.findUnique({
            where: { barcode },
        });

        if (!globalProduct) {
            return NextResponse.json({
                found: false,
                message: 'Product not found in global catalog',
            });
        }

        // Check if this business has local pricing/stock
        const storeProduct = await prisma.storeProduct.findFirst({
            where: {
                globalProductId: globalProduct.id,
                businessId,
            },
        });

        return NextResponse.json({
            found: true,
            global: globalProduct,
            local: storeProduct || null,
        });
    } catch (error) {
        console.error('[POS Product Search Error]', error);
        return NextResponse.json(
            { error: 'Failed to search product' },
            { status: 500 }
        );
    }
}
