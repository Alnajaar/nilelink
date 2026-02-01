import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

// GET /api/subscriptions/subscribers - Get all subscribers for the supplier
export async function GET(req: NextRequest) {
  return withAuth(async (user) => {
    try {
      // Extract supplier ID from user
      const supplierId = user.walletAddress;

      // In a real application, this would fetch from a database
      // For now, we'll return mock data based on supplier ID
      
      // Mock subscribers data
      const subscribers = [
        {
          id: `sub-${Date.now()}-1`,
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
          supplierId: supplierId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `sub-${Date.now()}-2`,
          customerId: 'cust-456',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@example.com',
          planId: 'plan-2',
          planName: 'Bi-weekly Eggs & Dairy',
          status: 'PAUSED',
          startDate: '2024-01-10',
          nextDelivery: '2024-01-24',
          deliveryAddress: '456 Oak Ave, City, State 12345',
          deliveryTime: 'Afternoon (12PM-5PM)',
          totalSpent: 91.98,
          lastOrderDate: '2024-01-10',
          supplierId: supplierId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return Response.json({
        success: true,
        subscribers
      });
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }
  })(req);
}