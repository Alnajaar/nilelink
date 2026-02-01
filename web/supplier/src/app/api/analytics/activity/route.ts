import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return Response.json(
        { error: 'supplierId is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch from the database
    // For now, return mock activity data
    const mockActivity = [
      {
        id: 'act-001',
        action: 'New order received from Cairo Cafe',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        type: 'order'
      },
      {
        id: 'act-002',
        action: 'Inventory updated for Coffee Beans',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        type: 'inventory'
      },
      {
        id: 'act-003',
        action: 'Payment received from Restaurant ABC',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        type: 'payment'
      },
      {
        id: 'act-004',
        action: 'Product added: Premium Tea Bags',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        type: 'product'
      },
      {
        id: 'act-005',
        action: 'Order fulfilled for Bakery XYZ',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        type: 'fulfillment'
      }
    ];

    return Response.json(mockActivity);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}