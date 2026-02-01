import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supplierId = searchParams.get('supplierId');
    
    if (!supplierId) {
      return Response.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would fetch from:
    // 1. Database for inventory records
    // 2. Database for order records
    // 3. Smart contracts for blockchain verified transactions
    // 4. The Graph for decentralized analytics
    // 5. IPFS for distributed data storage
    
    const dashboardData = {
      inventory: [
        { id: '1', name: 'Coffee Beans Premium', sku: 'CBP-001', current: 45, minStock: 20, unit: 'kg', lastUpdated: new Date().toISOString(), category: 'Beverages', price: 25.99 },
        { id: '2', name: 'Milk Whole', sku: 'MW-001', current: 12, minStock: 15, unit: 'liters', lastUpdated: new Date().toISOString(), category: 'Dairy', price: 3.49 },
        { id: '3', name: 'Sugar White', sku: 'SW-001', current: 8, minStock: 10, unit: 'kg', lastUpdated: new Date().toISOString(), category: 'Pantry', price: 2.99 },
        { id: '4', name: 'Paper Cups', sku: 'PC-001', current: 200, minStock: 100, unit: 'pieces', lastUpdated: new Date().toISOString(), category: 'Packaging', price: 0.15 },
        { id: '5', name: 'Chicken Breast Fillets', sku: 'CBF-001', current: 0, minStock: 5, unit: 'kg', lastUpdated: new Date().toISOString(), category: 'Meat', price: 12.99 }
      ],
      orders: [
        { id: 'ORD-001', restaurant: 'Cairo Cafe Downtown', items: 3, total: 1250, status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString(), itemsDetails: [{ name: 'Coffee Beans', qty: 2, price: 25.99 }] },
        { id: 'ORD-002', restaurant: 'Alexandria Bistro', items: 5, total: 2100, status: 'approved', createdAt: new Date(Date.now() - 7200000).toISOString(), itemsDetails: [{ name: 'Milk', qty: 5, price: 3.49 }] },
        { id: 'ORD-003', restaurant: 'Giza Grill House', items: 2, total: 850, status: 'delivered', createdAt: new Date(Date.now() - 86400000).toISOString(), itemsDetails: [{ name: 'Chicken', qty: 1, price: 12.99 }] },
        { id: 'ORD-004', restaurant: 'Luxor Restaurant', items: 7, total: 1800, status: 'processing', createdAt: new Date(Date.now() - 1800000).toISOString(), itemsDetails: [{ name: 'Sugar', qty: 3, price: 2.99 }] },
        { id: 'ORD-005', restaurant: 'Aswan Delight', items: 4, total: 950, status: 'shipped', createdAt: new Date(Date.now() - 10800000).toISOString(), itemsDetails: [{ name: 'Paper Cups', qty: 100, price: 0.15 }] }
      ],
      stats: {
        totalOrders: 142,
        pendingOrders: 8,
        lowStockItems: 2,
        revenue: 45000,
        growth: 12.5,
        efficiency: 94,
        monthlyTrends: [
          { month: 'Jan', revenue: 38000 },
          { month: 'Feb', revenue: 42000 },
          { month: 'Mar', revenue: 45000 },
          { month: 'Apr', revenue: 48000 },
          { month: 'May', revenue: 52000 },
          { month: 'Jun', revenue: 56000 }
        ],
        topProducts: [
          { name: 'Roma Tomatoes', revenue: 12500, orders: 50 },
          { name: 'Chicken Breast', revenue: 10200, orders: 30 },
          { name: 'Basmati Rice', revenue: 9800, orders: 61 },
          { name: 'Olive Oil', revenue: 7200, orders: 15 },
          { name: 'Yellow Onions', revenue: 6900, orders: 77 }
        ],
        topCustomers: [
          { name: 'Cairo Grill', orders: 45, revenue: 25000 },
          { name: 'Nile Bistro', orders: 38, revenue: 19500 },
          { name: 'Delta Kitchen', orders: 32, revenue: 18000 }
        ]
      },
      credit: {
        available: 50000,
        utilizationRate: 15,
        terms: 'NET 30',
        invoices: [],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        creditScore: 850,
        creditLimit: 100000,
        utilized: 15000,
        availableBalance: 85000,
        paymentHistory: [
          { date: '2024-01-15', amount: 5000, status: 'paid' },
          { date: '2024-02-15', amount: 7500, status: 'paid' },
          { date: '2024-03-15', amount: 6200, status: 'paid' },
          { date: '2024-04-15', amount: 4300, status: 'pending' }
        ]
      }
    };

    return Response.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}