// web/pos/src/app/api/onboarding/plan-selection/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { prisma } from '@shared/lib/prisma'

interface PlanSelectionRequest {
  userId?: string
  planId: string
  billingCycle: 'monthly' | 'yearly'
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be logged in' },
        { status: 401 }
      )
    }

    const body: PlanSelectionRequest = await request.json()
    const { planId, billingCycle } = body
    
    // Validate plan selection
    const validPlans = ['starter', 'business', 'premium']
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan selection' },
        { status: 400 }
      )
    }
    
    // Get user's business
    const business = await prisma.business.findFirst({
      where: { ownerId: session.user.id }
    })
    
    if (!business) {
      return NextResponse.json(
        { error: 'Business profile not found. Please complete business information first.' },
        { status: 400 }
      )
    }
    
    // Update business with selected plan
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        plan: planId.toUpperCase(),
        updatedAt: new Date()
      }
    })
    
    // Calculate plan expiry (simplified - in reality would integrate with payment system)
    const planExpiry = new Date()
    planExpiry.setFullYear(planExpiry.getFullYear() + (billingCycle === 'yearly' ? 1 : 0))
    planExpiry.setMonth(planExpiry.getMonth() + (billingCycle === 'monthly' ? 1 : 0))
    
    // Update business with expiry date
    await prisma.business.update({
      where: { id: business.id },
      data: {
        planExpiry,
        updatedAt: new Date()
      }
    })
    
    // Store plan selection in user session/preferences
    // This would typically be handled by the auth provider
    
    return NextResponse.json({
      success: true,
      message: 'Plan selected successfully',
      businessId: updatedBusiness.id,
      planId: updatedBusiness.plan,
      planExpiry: planExpiry.toISOString()
    })
    
  } catch (error: any) {
    console.error('Plan selection API error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}