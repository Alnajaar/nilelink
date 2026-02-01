import { NextRequest } from 'next/server';

// In-memory storage for demo purposes
// In a real application, this would be stored in a database
let onboardingStatuses: Record<string, { completed: boolean; currentStep: number; lastUpdated: string }> = {};

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

    // Check if user has an existing onboarding status
    const status = onboardingStatuses[userId] || {
      userId,
      completed: false,
      currentStep: 0,
      lastUpdated: new Date().toISOString()
    };

    return Response.json(status);
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, completed, currentStep } = await req.json();

    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Update the onboarding status
    onboardingStatuses[userId] = {
      completed: completed ?? false,
      currentStep: currentStep ?? 0,
      lastUpdated: new Date().toISOString()
    };

    return Response.json({
      success: true,
      message: 'Onboarding status updated successfully',
      data: onboardingStatuses[userId]
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}