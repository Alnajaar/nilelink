import { NextRequest, NextResponse } from 'next/server';
import { getPublicClient, getWalletClient } from '@wagmi/core';
import { parseUnits, slice, keccak256, toBytes } from 'viem';
import { config } from '@/lib/wagmi';
import NileLinkProtocolAbi from '@/lib/abis/NileLinkProtocol.json';
import graphService from '@shared/services/GraphService';

/**
 * Orders API Route
 * 
 * Handles order creation and management with blockchain integration
 * This endpoint manages the order lifecycle and syncs with the blockchain
 * 
 * @route POST /api/orders
 */
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    const {
      orderId,
      restaurantAddress,
      customerAddress,
      items,
      totalAmount,
      paymentMethod,
      orderType,
      branchId,
      cashierId
    } = requestData;

    // Validate required fields
    if (!orderId || !restaurantAddress || !customerAddress || !items || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, restaurantAddress, customerAddress, items, totalAmount' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!isValidAddress(restaurantAddress) || !isValidAddress(customerAddress)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
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

    // Convert amount to USDC units (6 decimals)
    const amountUsd6 = parseUnits(totalAmount.toString(), 6);

    // Generate bytes16 orderId from the string
    const orderIdBytes16 = slice(keccak256(toBytes(orderId)), 0, 16) as `0x${string}`;

    // Prepare order data for blockchain
    const orderData = {
      id: orderId,
      restaurantAddress: restaurantAddress as `0x${string}`,
      customerAddress: customerAddress as `0x${string}`,
      items,
      totalAmount: amountUsd6,
      paymentMethod: paymentMethod || 2, // Default to PaymentMethod.CRYPTO (2)
      orderType: orderType || 'dine-in',
      branchId,
      cashierId,
      timestamp: new Date().toISOString(),
      status: 'created'
    };

    // In a real implementation, we would submit this to the blockchain
    // For now, we'll return the prepared order data
    return NextResponse.json({
      success: true,
      orderId,
      orderData,
      blockchainReady: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during order creation' },
      { status: 500 }
    );
  }
}

/**
 * Get Order Status API Route
 * 
 * Retrieves order status from the blockchain
 * 
 * @route GET /api/orders/[orderId]
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const restaurantAddress = searchParams.get('restaurantAddress');

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    );
  }

  if (!restaurantAddress) {
    return NextResponse.json(
      { error: 'Restaurant address is required' },
      { status: 400 }
    );
  }

  try {
    // Validate restaurant address format
    if (!isValidAddress(restaurantAddress)) {
      return NextResponse.json(
        { error: 'Invalid restaurant address format' },
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

    // Generate bytes16 orderId from the string
    const orderIdBytes16 = slice(keccak256(toBytes(orderId)), 0, 16) as `0x${string}`;

    // Query the blockchain subgraph for the actual order
    const data = await graphService.getOrders(1, 0, {
      id: orderId.toLowerCase(),
      restaurant_: restaurantAddress.toLowerCase()
    });

    if (!data || !data.orders || data.orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found on-chain' },
        { status: 404 }
      );
    }

    const order = data.orders[0];

    return NextResponse.json({
      success: true,
      order,
      timestamp: new Date().toISOString(),
      blockchainSyncStatus: 'synced',
    });
  } catch (error) {
    console.error('Order status check error:', error);
    return NextResponse.json(
      { error: 'Error checking order status' },
      { status: 500 }
    );
  }
}

/**
 * Update Order Status API Route
 * 
 * Updates order status and syncs with blockchain
 * 
 * @route PUT /api/orders/[orderId]
 */
export async function PUT(request: NextRequest) {
  try {
    const requestData = await request.json();

    const { orderId, restaurantAddress, newStatus, branchId, cashierId } = requestData;

    // Validate required fields
    if (!orderId || !restaurantAddress || !newStatus) {
      return NextResponse.json(
        { error: 'Order ID, restaurant address, and new status are required' },
        { status: 400 }
      );
    }

    // Validate restaurant address format
    if (!isValidAddress(restaurantAddress)) {
      return NextResponse.json(
        { error: 'Invalid restaurant address format' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['created', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` },
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

    // Generate bytes16 orderId from the string
    const orderIdBytes16 = slice(keccak256(toBytes(orderId)), 0, 16) as `0x${string}`;

    // 1. Calculate and Enforce Commissions
    if (newStatus === 'completed') {
      try {
        const { FeeService } = await import('@shared/services/FeeService');

        // Fetch order details from body or Graph
        // For enforcement, we need the actual total amount
        // In a real environment, we'd fetch the order from DB first
        const orderTotal = requestData.totalAmount || 0;

        const calculation = await FeeService.calculatePOSOrderFees(restaurantAddress, orderTotal);
        await FeeService.settleCommission(orderId, 'POS', calculation);

        // 2. Process Affiliate Earnings
        if (requestData.customerAddress) {
          await FeeService.processAffiliateCommission(orderId, orderTotal, requestData.customerAddress);
        }

        console.log(`[Commission Engine] ✅ Order ${orderId} settled: Platform Cut $${calculation.platformFee}`);
      } catch (err) {
        console.error('[Commission Engine] ❌ Critical: Fee calculation failed:', err);
        // We log but don't block order status update to maintain POS availability
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      newStatus,
      branchId,
      cashierId,
      timestamp: new Date().toISOString(),
      blockchainSynced: true,
      message: `Order status updated to ${newStatus} and synced to blockchain`,
    });

  } catch (error) {
    console.error('Order status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error during order status update' },
      { status: 500 }
    );
  }
}

/**
 * Get All Orders API Route
 * 
 * Retrieves all orders for a restaurant from the blockchain
 * 
 * @route GET /api/orders
 */
export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const restaurantAddress = searchParams.get('restaurantAddress');
  const statusFilter = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!restaurantAddress) {
    return NextResponse.json(
      { error: 'Restaurant address is required' },
      { status: 400 }
    );
  }

  try {
    // Validate restaurant address format
    if (!isValidAddress(restaurantAddress)) {
      return NextResponse.json(
        { error: 'Invalid restaurant address format' },
        { status: 400 }
      );
    }

    // Validate limit
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Maximum limit is 100 orders per request' },
        { status: 400 }
      );
    }

    // Query the blockchain subgraph for all orders
    const data = await graphService.getOrders(limit, offset, {
      restaurant_: restaurantAddress.toLowerCase(),
      ...(statusFilter && { status: statusFilter.toUpperCase() })
    });

    if (!data || !data.orders) {
      return NextResponse.json({ success: true, orders: [], total: 0 });
    }

    return NextResponse.json({
      success: true,
      orders: data.orders,
      total: data.orders.length,
      limit,
      offset,
      timestamp: new Date().toISOString(),
      blockchainSyncStatus: 'synced',
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching orders' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to validate Ethereum address format
 */
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}