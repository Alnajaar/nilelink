import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return Response.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Verify supplier exists (via user correlation)
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: supplierId }
    });

    if (!supplier) {
      return Response.json([]);
    }

    const inventoryItems = await prisma.inventory.findMany({
      where: {
        supplierId: supplier.id
      },
      include: {
        product: true
      },
      orderBy: {
        product: {
          name: 'asc'
        }
      }
    });

    // Map to frontend expected format
    const formattedInventory = inventoryItems.map(item => ({
      id: item.productId, // Use productId as the key reference
      inventoryId: item.id,
      name: item.product.name,
      sku: item.product.sku,
      current: item.quantity,
      minStock: item.minStock,
      unit: 'units', // Defaulting for now as it's not in schema yet
      lastUpdated: item.updatedAt.toISOString(),
      category: item.product.category,
      price: item.product.price
    }));

    return Response.json(formattedInventory);
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return Response.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get('supplierId'); // Optional check

    const body = await request.json();
    const { itemId, quantity, supplierId: bodySupplierId } = body;
    // Note: itemId comes as productId from the frontend usually, or inventoryId. 
    // The previous GET returns id = productId.

    // Update inventory
    // We try to find by productId first (since that's what we mapped id to)

    const updated = await prisma.inventory.update({
      where: { productId: itemId },
      data: {
        quantity: {
          increment: parseInt(quantity)
        }
      },
      include: {
        product: true
      }
    });

    return Response.json({
      success: true,
      message: `Successfully restocked item ${updated.product.name} with ${quantity} units`,
      newQuantity: updated.quantity,
      updatedItem: updated
    });
  } catch (error) {
    console.error('Error restocking inventory:', error);
    return Response.json(
      { error: 'Failed to restock inventory' },
      { status: 500 }
    );
  }
}
