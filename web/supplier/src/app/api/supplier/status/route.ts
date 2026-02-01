import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch from the database
    // For now, return a mock response indicating onboarding status
    return Response.json({
      userId,
      onboardingCompleted: true, // Assume true for demo purposes
      profileComplete: true,
      productsAdded: 5,
      ordersReceived: 12,
      revenue: 24500,
      rating: 4.8,
      lastActive: new Date().toISOString(),
      accountStatus: 'active'
    });
  } catch (error) {
    console.error('Error fetching supplier status:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}