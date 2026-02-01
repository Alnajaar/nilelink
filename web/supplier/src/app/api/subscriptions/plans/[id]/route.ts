import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

// GET /api/subscriptions/plans/[id] - Get a specific subscription plan
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (user) => {
    try {
      const { id } = params;
      
      // In a real application, this would fetch from a database
      // For now, we'll return mock data
      
      const plan = {
        id,
        name: 'Weekly Milk Delivery',
        description: 'Fresh organic milk delivered weekly',
        price: 29.99,
        billingCycle: 'monthly',
        visibility: 'PUBLIC',
        maxSubscribers: 100,
        currentSubscribers: 24,
        productId: 'prod-1',
        deliverySchedule: 'weekly',
        supplierId: user.walletAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return Response.json({
        success: true,
        plan
      });
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch subscription plan' },
        { status: 500 }
      );
    }
  })(req);
}

// PUT /api/subscriptions/plans/[id] - Update a specific subscription plan
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (user) => {
    try {
      const { id } = params;
      const body = await req.json();
      
      // In a real application, this would update in a database
      // For now, we'll return the updated plan
      
      const updatedPlan = {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      };

      return Response.json({
        success: true,
        plan: updatedPlan
      });
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return Response.json(
        { success: false, error: 'Failed to update subscription plan' },
        { status: 500 }
      );
    }
  })(req);
}

// DELETE /api/subscriptions/plans/[id] - Delete a specific subscription plan
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(async (user) => {
    try {
      const { id } = params;
      
      // In a real application, this would delete from a database
      // For now, we'll return a success response
      
      return Response.json({
        success: true,
        message: 'Subscription plan deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      return Response.json(
        { success: false, error: 'Failed to delete subscription plan' },
        { status: 500 }
      );
    }
  })(req);
}