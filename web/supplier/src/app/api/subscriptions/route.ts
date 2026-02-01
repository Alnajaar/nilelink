import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

// GET /api/subscriptions - Get all subscription plans for the supplier
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      // Extract supplier ID from user
      const supplierId = user.walletAddress;

      // In a real application, this would fetch from a database
      // For now, we'll return mock data based on supplier ID
      
      // Mock subscription plans data
      const plans = [
        {
          id: `plan-${Date.now()}-1`,
          name: 'Weekly Milk Delivery',
          description: 'Fresh organic milk delivered weekly',
          price: 29.99,
          billingCycle: 'monthly',
          visibility: 'PUBLIC',
          maxSubscribers: 100,
          currentSubscribers: 24,
          productId: 'prod-1',
          deliverySchedule: 'weekly',
          supplierId: supplierId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `plan-${Date.now()}-2`,
          name: 'Bi-weekly Eggs & Dairy',
          description: 'Free-range eggs and dairy products bi-weekly',
          price: 45.99,
          billingCycle: 'monthly',
          visibility: 'PUBLIC',
          maxSubscribers: 50,
          currentSubscribers: 18,
          productId: 'prod-2',
          deliverySchedule: 'bi-weekly',
          supplierId: supplierId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return Response.json({
        success: true,
        plans
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }
  })(req);
}

// POST /api/subscriptions - Create a new subscription plan
export async function POST(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      const body = await req.json();
      
      // Validate required fields
      if (!body.name || !body.description || body.price === undefined) {
        return Response.json(
          { success: false, error: 'Missing required fields: name, description, price' },
          { status: 400 }
        );
      }
      
      // Extract supplier ID from user
      const supplierId = user.walletAddress;

      // In a real application, this would save to a database
      // For now, we'll return the plan with an ID
      const newPlan = {
        id: `plan-${Date.now()}`,
        ...body,
        supplierId: supplierId,
        maxSubscribers: body.maxSubscribers || 100,
        currentSubscribers: 0,
        visibility: body.visibility || 'PUBLIC',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return Response.json({
        success: true,
        plan: newPlan
      });
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return Response.json(
        { success: false, error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }
  })(req);
}