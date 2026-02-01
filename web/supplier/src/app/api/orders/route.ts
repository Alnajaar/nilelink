import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get('supplierId');
    const statusParam = searchParams.get('status');

    if (!supplierId) {
      return Response.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch real purchase orders from The Graph
    // const orders = await graphService.getPurchaseOrdersBySupplier(supplierId);
    // For now, return empty array until GraphService integration is complete

    const orders: any[] = [];

    // Filter by status if provided
    const filteredOrders = statusParam
      ? orders.filter((order: any) => statusParam.split(',').includes(order.status))
      : orders;

    return Response.json(filteredOrders);
  } catch (error) {
    console.error('Error fetching orders data:', error);
    return Response.json(
      { error: 'Failed to fetch orders data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return Response.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orderId, action } = body;

    // In a real implementation, this would update order status in:
    // 1. Database
    // 2. Smart contract for blockchain verification
    // 3. IPFS for immutable record keeping

    if (action === 'approve') {
      try {
        const { FeeService } = await import('@shared/services/FeeService');
        const { prisma } = await import('@shared/utils/prisma');

        // Fetch order amount from DB (Real logic)
        // For now we assume body.amount is provided if DB is being initialized
        const orderAmount = body.amount || 0;

        const calculation = await FeeService.calculateSupplierFees(supplierId, orderAmount);
        await FeeService.settleCommission(orderId, 'SUPPLIER', calculation);

        // Update local DB status if order exists
        await prisma.order.updateMany({
          where: { id: orderId, supplierId },
          data: { status: 'SHIPPED' } // 'approved' maps to SHIPPED in our schema
        });

        return Response.json({
          success: true,
          message: `Order ${orderId} approved and platform commission of $${calculation.platformFee} settled.`,
          newStatus: 'shipped',
          calculation
        });
      } catch (err) {
        console.error('[Supplier Commission] ❌ Error:', err);
        return Response.json({ error: 'Commission sync failed' }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}