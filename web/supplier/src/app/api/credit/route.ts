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
    // 1. Smart contracts for credit information
    // 2. Blockchain for trustless verification
    // 3. Database for historical credit data
    
    const credit = {
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
    };

    return Response.json(credit);
  } catch (error) {
    console.error('Error fetching credit data:', error);
    return Response.json(
      { error: 'Failed to fetch credit data' },
      { status: 500 }
    );
  }
}