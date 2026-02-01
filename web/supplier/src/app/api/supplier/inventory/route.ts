import { NextRequest } from 'next/server';
import { SupplierService } from '@shared/services/SupplierService';
import { MockDatabaseService } from '@shared/services/DatabaseService';
import { NotificationService } from '@shared/services/NotificationService';
import { CommissionService } from '@shared/services/CommissionService';

// Initialize services (in a real implementation, these would be injected or singleton instances)
const dbService = new MockDatabaseService();
const notificationService = new NotificationService();
const commissionService = new CommissionService(dbService);
const supplierService = new SupplierService(dbService, notificationService, commissionService);

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const supplierId = url.searchParams.get('supplierId');
    
    if (!supplierId) {
      return Response.json({ error: 'Supplier ID is required' }, { status: 400 });
    }
    
    const inventoryData = await request.json();
    
    // Validate required fields for inventory item
    if (!inventoryData.sku || !inventoryData.productName || inventoryData.price === undefined) {
      return Response.json(
        { error: 'Missing required fields: sku, productName, price' },
        { status: 400 }
      );
    }
    
    // Add the inventory item
    const newInventoryItem = await supplierService.addInventoryItem(supplierId, {
      sku: inventoryData.sku,
      productName: inventoryData.productName,
      description: inventoryData.description,
      category: inventoryData.category || 'general',
      price: parseFloat(inventoryData.price.toString()),
      costPrice: inventoryData.costPrice ? parseFloat(inventoryData.costPrice.toString()) : undefined,
      stockQuantity: parseInt(inventoryData.stockQuantity?.toString() || '0'),
      minStockThreshold: parseInt(inventoryData.minStockThreshold?.toString() || '5'),
      maxOrderQuantity: inventoryData.maxOrderQuantity ? parseInt(inventoryData.maxOrderQuantity.toString()) : undefined,
      weight: inventoryData.weight ? parseFloat(inventoryData.weight.toString()) : undefined,
      dimensions: inventoryData.dimensions,
      images: inventoryData.images || [],
      isActive: inventoryData.isActive ?? true
    });
    
    return Response.json(
      { 
        success: true, 
        inventoryItem: newInventoryItem,
        message: 'Inventory item added successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error adding inventory item:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const supplierId = url.searchParams.get('supplierId');
    
    if (!supplierId) {
      return Response.json({ error: 'Supplier ID is required' }, { status: 400 });
    }
    
    const category = url.searchParams.get('category');
    const inStockOnly = url.searchParams.get('inStockOnly') === 'true';
    const searchQuery = url.searchParams.get('search');
    
    const filters: any = {};
    if (category) filters.category = category;
    if (inStockOnly) filters.inStockOnly = true;
    if (searchQuery) filters.searchQuery = searchQuery;
    
    const inventoryItems = await supplierService.getSupplierInventory(supplierId, filters);
    
    return Response.json({ success: true, inventoryItems, count: inventoryItems.length });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const supplierId = url.searchParams.get('supplierId');
    
    if (!supplierId) {
      return Response.json({ error: 'Supplier ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Expecting an array of inventory updates
    if (!Array.isArray(updateData) || updateData.length === 0) {
      return Response.json(
        { error: 'Expected an array of inventory updates' },
        { status: 400 }
      );
    }
    
    // Validate each update
    for (const update of updateData) {
      if (!update.inventoryId) {
        return Response.json(
          { error: 'Each update must include inventoryId' },
          { status: 400 }
        );
      }
    }
    
    // Perform the inventory updates
    const success = await supplierService.updateInventory(supplierId, updateData);
    
    if (!success) {
      return Response.json(
        { error: 'Failed to update inventory' },
        { status: 500 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}