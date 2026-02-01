// web/pos/src/app/api/onboarding/business-info/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { prisma } from '@shared/lib/prisma'

interface BusinessInfoRequest {
  userId?: string
  businessInfo: {
    businessName: string
    businessCategory: string
    country: string
    city: string
    zone: string
    phoneNumber: string
    exactLocation: string
  }
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

    const body: BusinessInfoRequest = await request.json()
    const { businessInfo } = body
    
    // Validate required fields
    const requiredFields = [
      'businessName',
      'businessCategory', 
      'country',
      'city',
      'phoneNumber',
      'exactLocation'
    ]
    
    for (const field of requiredFields) {
      if (!businessInfo[field as keyof typeof businessInfo]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Update user with business information and mark onboarding as in progress
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingStatus: 'pending', // Still pending until all steps completed
        // Store business info in a separate business profile or extend user model
        // For now, we'll store in localStorage/session and create business record
      }
    })
    
    // Create business profile record
    const business = await prisma.business.create({
      data: {
        id: `biz_${Math.random().toString(36).substr(2, 9)}`,
        ownerId: session.user.id,
        name: businessInfo.businessName,
        businessType: businessInfo.businessCategory,
        country: businessInfo.country,
        city: businessInfo.city,
        zone: businessInfo.zone || null,
        phoneNumber: businessInfo.phoneNumber,
        location: businessInfo.exactLocation,
        status: 'ACTIVE',
        plan: 'STARTER', // Default plan until selection step
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // Store business info in user session for subsequent steps
    // This would typically be handled by the auth provider updating the session
    
    return NextResponse.json({
      success: true,
      message: 'Business information saved successfully',
      businessId: business.id,
      userId: updatedUser.id
    })
    
  } catch (error: any) {
    console.error('Business info API error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}