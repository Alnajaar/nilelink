import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get('supplierId');
    const range = searchParams.get('range') || 'last30days';

    if (!supplierId) {
      return Response.json(
        { error: 'supplierId is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch from the database based on the date range
    // For now, return mock analytics data
    const mockAnalytics = {
      revenue: {
        current: 24500,
        previous: 19800,
        growth: 23.7
      },
      orders: {
        current: 124,
        previous: 98,
        growth: 26.5
      },
      products: {
        active: 28,
        lowStock: 5,
        outOfStock: 2
      },
      customers: {
        new: 18,
        returning: 82,
        total: 100
      },
      topProducts: [
        {
          id: 'prod-001',
          name: 'Premium Coffee Beans',
          sales: 42,
          revenue: 1090.80
        },
        {
          id: 'prod-002',
          name: 'Artisan Bread Loaves',
          sales: 38,
          revenue: 341.62
        },
        {
          id: 'prod-003',
          name: 'Organic Milk Gallon',
          sales: 31,
          revenue: 74.40
        },
        {
          id: 'prod-004',
          name: 'Fresh Eggs Dozen',
          sales: 29,
          revenue: 58.00
        },
        {
          id: 'prod-005',
          name: 'Premium Olive Oil',
          sales: 24,
          revenue: 144.00
        }
      ],
      dailyRevenue: [
        { date: '2023-05-01', revenue: 450 },
        { date: '2023-05-02', revenue: 520 },
        { date: '2023-05-03', revenue: 380 },
        { date: '2023-05-04', revenue: 610 },
        { date: '2023-05-05', revenue: 490 },
        { date: '2023-05-06', revenue: 720 },
        { date: '2023-05-07', revenue: 580 }
      ],
      categoryDistribution: [
        { name: 'Food & Beverages', value: 65 },
        { name: 'Household Essentials', value: 15 },
        { name: 'Health & Beauty', value: 10 },
        { name: 'Other', value: 10 }
      ]
    };

    return Response.json(mockAnalytics);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}