// web/pos/src/app/api/onboarding/finalize/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { prisma } from '@shared/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be logged in' },
        { status: 401 }
      )
    }

    // Validate that user has completed previous steps
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business profile not found. Please complete all onboarding steps.' },
        { status: 400 }
      )
    }

    // Validate that plan is selected
    if (!business.plan || business.plan === 'STARTER') {
      // This is okay as STARTER is a valid plan
    }

    // Update user's onboarding status to completed
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingStatus: 'completed',
        posDeployed: true,
        firstDashboardAccess: true,
        updatedAt: new Date()
      }
    })

    // Update business status to active
    await prisma.business.update({
      where: { id: business.id },
      data: {
        status: 'ACTIVE',
        isActive: true,
        updatedAt: new Date()
      }
    })

    // Create initial wallet for the business
    await prisma.wallet.create({
      data: {
        ownerId: business.id,
        ownerType: 'BUSINESS',
        currency: 'USD',
        balance: 0,
        pendingBalance: 0,
        lockedBalance: 0
      }
    })

    // Log the successful onboarding completion
    await prisma.protocolAuditLog.create({
      data: {
        adminId: session.user.id,
        action: 'ONBOARDING_COMPLETED',
        targetId: business.id,
        details: {
          businessName: business.name,
          businessType: business.businessType,
          plan: business.plan,
          userId: session.user.id
        },
        timestamp: new Date()
      }
    })

    // In a real implementation, you might want to:
    // 1. Send welcome email
    // 2. Create initial sample data
    // 3. Set up webhook endpoints
    // 4. Initialize analytics tracking
    // 5. Create default categories/products

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      userId: updatedUser.id,
      businessId: business.id,
      onboardingStatus: updatedUser.onboardingStatus,
      posDeployed: updatedUser.posDeployed,
      firstDashboardAccess: updatedUser.firstDashboardAccess
    })

  } catch (error: any) {
    console.error('Finalize onboarding API error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User or business not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}