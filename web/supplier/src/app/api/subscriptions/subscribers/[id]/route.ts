import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

// GET /api/subscriptions/subscribers/[id] - Get a specific subscriber
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (user) => {
    try {
      const { id } = params;
      
      // In a real application, this would fetch from a database
      // For now, we'll return mock data
      
      const subscriber = {
        id,
        customerId: 'cust-123',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        planId: 'plan-1',
        planName: 'Weekly Milk Delivery',
        status: 'ACTIVE',
        startDate: '2024-01-15',
        nextDelivery: '2024-01-22',
        deliveryAddress: '123 Main St, City, State 12345',
        deliveryTime: 'Morning (8AM-12PM)',
        totalSpent: 125.97,
        lastOrderDate: '2024-01-15',
        supplierId: user.walletAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return Response.json({
        success: true,
        subscriber
      });
    } catch (error) {
      console.error('Error fetching subscriber:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch subscriber' },
        { status: 500 }
      );
    }
  })(req);
}

// PUT /api/subscriptions/subscribers/[id] - Update a specific subscriber
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (user) => {
    try {
      const { id } = params;
      const body = await req.json();
      
      // In a real application, this would update in a database
      // For now, we'll return the updated subscriber
      
      const updatedSubscriber = {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      };

      return Response.json({
        success: true,
        subscriber: updatedSubscriber
      });
    } catch (error) {
      console.error('Error updating subscriber:', error);
      return Response.json(
        { success: false, error: 'Failed to update subscriber' },
        { status: 500 }
      );
    }
  })(req);
}