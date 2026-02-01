import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!supplierId) {
      return Response.json(
        { error: 'supplierId is required' },
        { status: 400 }
      );
    }

    // Verify supplier exists
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: supplierId }
    });

    if (!supplier) {
      // If no profile exists, return empty list (or 404 depending on logic)
      return Response.json([]);
    }

    const where: any = {
      supplierId: supplier.id,
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        inventory: true
      }
    });

    return Response.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const productData = await req.json();

    // Validate required fields
    if (!productData.name || !productData.sku || !productData.price || !productData.supplierId) {
      return Response.json(
        { error: 'Missing required fields: name, sku, price, supplierId' },
        { status: 400 }
      );
    }

    // Get Supplier Profile ID from User ID
    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: productData.supplierId }
    });

    if (!supplier) {
      // Auto-create profile if missing (for seamless onboarding)
      const newProfile = await prisma.supplierProfile.create({
        data: {
          userId: productData.supplierId,
          companyName: 'New Supplier', // Placeholder
          status: 'VERIFIED' // Auto-verify for now
        }
      });

      // Use the new profile ID
      return createProduct(newProfile.id, productData);
    }

    return createProduct(supplier.id, productData);

  } catch (error) {
    console.error('Error in product API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createProduct(profileId: string, data: any) {
  const newProduct = await prisma.product.create({
    data: {
      supplierId: profileId,
      name: data.name,
      description: data.description,
      sku: data.sku,
      category: data.category || 'Uncategorized',
      price: parseFloat(data.price),
      cost: data.cost ? parseFloat(data.cost) : null,
      currency: data.currency || 'USD',
      images: data.images || [],
      tags: data.tags || [],
      inventory: {
        create: {
          supplierId: profileId,
          quantity: parseInt(data.stock || '0'),
          minStock: parseInt(data.minStock || '10')
        }
      }
    },
    include: {
      inventory: true
    }
  });

  return Response.json(
    {
      success: true,
      message: 'Product added successfully',
      product: newProduct
    },
    { status: 201 }
  );
}

export async function PUT(req: NextRequest) {
  try {
    const productData = await req.json();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price ? parseFloat(productData.price) : undefined,
        images: productData.images,
        tags: productData.tags,
        isActive: productData.isActive
      }
    });

    // Update inventory if provided
    if (productData.stock !== undefined) {
      await prisma.inventory.update({
        where: { productId: productId },
        data: {
          quantity: parseInt(productData.stock)
        }
      });
    }

    return Response.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 });
    }

    // Soft delete usually, but here we can toggle active
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    return Response.json({ success: true, message: 'Product deactivated' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
