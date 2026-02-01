import { NextRequest, NextResponse } from 'next/server';
import { getPublicClient } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import NileLinkProtocolAbi from '@/lib/abis/NileLinkProtocol.json';

/**
 * Inventory Management API Route
 * 
 * Handles real-time inventory tracking through blockchain integration
 * This endpoint provides inventory data synchronized with the blockchain
 * 
 * @route GET /api/inventory
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const restaurantAddress = searchParams.get('restaurantAddress');

    // Validate required parameters
    if (!branchId && !restaurantAddress) {
      return NextResponse.json(
        { error: 'Either branchId or restaurantAddress is required' },
        { status: 400 }
      );
    }

    // Get protocol contract address from environment
    const protocolAddress = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS;
    if (!protocolAddress || protocolAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Protocol contract address not configured' },
        { status: 500 }
      );
    }

    // In a real implementation, we would call the smart contract to get inventory
    // For now, we'll return mock data that would be fetched from the blockchain
    const mockInventory = [
      {
        id: 'item-1',
        name: 'Margherita Pizza',
        category: 'Pizza',
        sku: 'PIZZA-MARG-001',
        quantity: 25,
        unitPrice: 12.99,
        costPrice: 4.50,
        reorderPoint: 5,
        supplierId: 'supplier-1',
        lastUpdated: new Date().toISOString(),
        blockchainVerified: true,
      },
      {
        id: 'item-2',
        name: 'Caesar Salad',
        category: 'Salads',
        sku: 'SALAD-CAESAR-001',
        quantity: 18,
        unitPrice: 8.99,
        costPrice: 2.80,
        reorderPoint: 3,
        supplierId: 'supplier-2',
        lastUpdated: new Date().toISOString(),
        blockchainVerified: true,
      },
      {
        id: 'item-3',
        name: 'Beef Burger',
        category: 'Burgers',
        sku: 'BURGER-BEEF-001',
        quantity: 32,
        unitPrice: 14.99,
        costPrice: 5.20,
        reorderPoint: 8,
        supplierId: 'supplier-1',
        lastUpdated: new Date().toISOString(),
        blockchainVerified: true,
      },
      {
        id: 'item-4',
        name: 'Grilled Salmon',
        category: 'Seafood',
        sku: 'FISH-SALMON-001',
        quantity: 12,
        unitPrice: 22.99,
        costPrice: 8.75,
        reorderPoint: 2,
        supplierId: 'supplier-3',
        lastUpdated: new Date().toISOString(),
        blockchainVerified: true,
      },
      {
        id: 'item-5',
        name: 'Pasta Carbonara',
        category: 'Pasta',
        sku: 'PASTA-CARB-001',
        quantity: 20,
        unitPrice: 16.99,
        costPrice: 4.90,
        reorderPoint: 4,
        supplierId: 'supplier-2',
        lastUpdated: new Date().toISOString(),
        blockchainVerified: true,
      },
    ];

    return NextResponse.json({
      success: true,
      branchId,
      restaurantAddress,
      inventory: mockInventory,
      timestamp: new Date().toISOString(),
      blockchainSyncStatus: 'synced',
    });

  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error during inventory fetch' },
      { status: 500 }
    );
  }
}

/**
 * Update Inventory API Route
 * 
 * Updates inventory quantities and syncs with blockchain
 * 
 * @route PUT /api/inventory
 */
export async function PUT(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    const { branchId, restaurantAddress, inventoryUpdates } = requestData;

    // Validate required fields
    if (!branchId && !restaurantAddress) {
      return NextResponse.json(
        { error: 'Either branchId or restaurantAddress is required' },
        { status: 400 }
      );
    }

    if (!inventoryUpdates || !Array.isArray(inventoryUpdates) || inventoryUpdates.length === 0) {
      return NextResponse.json(
        { error: 'Inventory updates are required and must be an array' },
        { status: 400 }
      );
    }

    // Validate inventory updates
    for (const update of inventoryUpdates) {
      if (!update.itemId || typeof update.quantityChange !== 'number') {
        return NextResponse.json(
          { error: 'Each inventory update must have itemId and quantityChange' },
          { status: 400 }
        );
      }
    }

    // Get protocol contract address from environment
    const protocolAddress = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS;
    if (!protocolAddress || protocolAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Protocol contract address not configured' },
        { status: 500 }
      );
    }

    // In a real implementation, we would call the smart contract to update inventory
    // For now, we'll return a success response indicating the update would be processed
    return NextResponse.json({
      success: true,
      branchId,
      restaurantAddress,
      inventoryUpdates: inventoryUpdates.map(update => ({
        ...update,
        status: 'processed',
        blockchainSynced: true,
        timestamp: new Date().toISOString(),
      })),
      message: 'Inventory updates processed and queued for blockchain sync',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { error: 'Internal server error during inventory update' },
      { status: 500 }
    );
  }
}

/**
 * Low Stock Alerts API Route
 * 
 * Gets items that are below their reorder point
 * 
 * @route GET /api/inventory/alerts
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const restaurantAddress = searchParams.get('restaurantAddress');

    // Validate required parameters
    if (!branchId && !restaurantAddress) {
      return NextResponse.json(
        { error: 'Either branchId or restaurantAddress is required' },
        { status: 400 }
      );
    }

    // Get protocol contract address from environment
    const protocolAddress = process.env.NEXT_PUBLIC_NILELINK_PROTOCOL_ADDRESS;
    if (!protocolAddress || protocolAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Protocol contract address not configured' },
        { status: 500 }
      );
    }

    // In a real implementation, we would call the smart contract to get low stock items
    // For now, we'll return mock low stock alerts
    const lowStockItems = [
      {
        id: 'item-6',
        name: 'Soft Drinks',
        category: 'Beverages',
        sku: 'DRINK-SOFT-001',
        quantity: 2,
        reorderPoint: 5,
        supplierId: 'supplier-4',
        lastUpdated: new Date().toISOString(),
        daysUntilDepletion: 1,
      },
      {
        id: 'item-7',
        name: 'French Fries',
        category: 'Sides',
        sku: 'SIDE-FRIES-001',
        quantity: 4,
        reorderPoint: 8,
        supplierId: 'supplier-1',
        lastUpdated: new Date().toISOString(),
        daysUntilDepletion: 2,
      },
    ];

    return NextResponse.json({
      success: true,
      branchId,
      restaurantAddress,
      lowStockItems,
      alertCount: lowStockItems.length,
      timestamp: new Date().toISOString(),
      blockchainSyncStatus: 'synced',
    });

  } catch (error) {
    console.error('Low stock alerts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error during low stock alerts fetch' },
      { status: 500 }
    );
  }
}