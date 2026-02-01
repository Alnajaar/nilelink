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
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.supplierId || !orderData.buyerId || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return Response.json(
        { error: 'Missing required fields: supplierId, buyerId, items (array)' },
        { status: 400 }
      );
    }
    
    // Validate each item in the order
    for (const item of orderData.items) {
      if (!item.inventoryId || !item.quantity || !item.unitPrice) {
        return Response.json(
          { error: 'Each order item must have inventoryId, quantity, and unitPrice' },
          { status: 400 }
        );
      }
    }
    
    // Process the order
    const newOrder = await supplierService.processOrder({
      supplierId: orderData.supplierId,
      buyerId: orderData.buyerId,
      items: orderData.items.map((item: any) => ({
        id: item.id || undefined,
        orderId: '', // Will be set by the service
        inventoryId: item.inventoryId,
        productName: item.productName || '',
        quantity: parseInt(item.quantity.toString()),
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalAmount: parseFloat(item.totalAmount?.toString() || (parseInt(item.quantity.toString()) * parseFloat(item.unitPrice.toString())).toString())
      })),
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      shippingOptionId: orderData.shippingOptionId,
      estimatedDeliveryDate: orderData.estimatedDeliveryDate ? new Date(orderData.estimatedDeliveryDate) : undefined,
      notes: orderData.notes
    });
    
    return Response.json(
      { 
        success: true, 
        order: newOrder,
        message: 'Order processed successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing order:', error);
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
    const orderId = url.searchParams.get('orderId');
    const buyerId = url.searchParams.get('buyerId');
    const status = url.searchParams.get('status');
    
    if (orderId) {
      // Return a specific order (would require a method in SupplierService to fetch individual orders)
      // For now, we'll return all orders for the supplier and filter
      if (!supplierId) {
        return Response.json({ error: 'Supplier ID is required when fetching specific order' }, { status: 400 });
      }
      
      const allOrders = await dbService.findByField('supplier_orders', 'supplierId', supplierId);
      const order = allOrders.find((o: any) => o.id === orderId);
      
      if (!order) {
        return Response.json({ error: 'Order not found' }, { status: 404 });
      }
      
      return Response.json({ success: true, order });
    } else {
      // Return orders for supplier with optional filters
      if (!supplierId) {
        return Response.json({ error: 'Supplier ID is required' }, { status: 400 });
      }
      
      let orders = await dbService.findByField('supplier_orders', 'supplierId', supplierId);
      
      // Apply filters if provided
      if (buyerId) {
        orders = orders.filter((order: any) => order.buyerId === buyerId);
      }
      
      if (status) {
        orders = orders.filter((order: any) => order.status === status);
      }
      
      return Response.json({ success: true, orders, count: orders.length });
    }
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const supplierId = url.searchParams.get('supplierId'); // For validation purposes
    
    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const updateData = await request.json();
    
    // Check if the order belongs to the supplier (for validation)
    if (supplierId) {
      const order = await dbService.findById('supplier_orders', orderId);
      if (order && order.supplierId !== supplierId) {
        return Response.json({ error: 'Unauthorized: Order does not belong to this supplier' }, { status: 403 });
      }
    }
    
    // Update order status
    if (updateData.status) {
      const success = await supplierService.updateOrderStatus(orderId, updateData.status);
      
      if (!success) {
        return Response.json({ error: 'Failed to update order status' }, { status: 500 });
      }
      
      // Fetch updated order to return
      const updatedOrder = await dbService.findById('supplier_orders', orderId);
      
      return Response.json({
        success: true,
        order: updatedOrder,
        message: 'Order status updated successfully'
      });
    } else {
      return Response.json({ error: 'Only status updates are supported' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating order:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}