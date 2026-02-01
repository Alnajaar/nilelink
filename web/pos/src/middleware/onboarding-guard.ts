// web/pos/src/middleware/onboarding-guard.ts
'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { prisma } from '@shared/lib/prisma'

/**
 * Global Onboarding Redirection Guard
 * 
 * This middleware enforces the mandatory onboarding flow:
 * 1. If not logged in → Allow public routes only
 * 2. If logged in but onboarding pending → Force redirect to /onboarding/business-info
 * 3. If logged in and onboarding completed → Force redirect to /dashboard
 * 4. Prevent access to onboarding if already completed
 * 
 * This eliminates infinite loops and ensures proper flow for all entry points.
 */

export async function onboardingGuard(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication or onboarding checks
  const publicRoutes = [
    '/login',
    '/signup',
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/icons/',
    '/images/',
    '/static/'
  ]
  
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    
    // If no session, allow the request to proceed (will be handled by auth middleware)
    if (!session?.user?.id) {
      return NextResponse.next()
    }
    
    // Get user from database with onboarding status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        onboardingStatus: true,
        posDeployed: true,
        firstDashboardAccess: true
      }
    })
    
    if (!user) {
      // User not found in database - this shouldn't happen but redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Handle onboarding completed users
    if (user.onboardingStatus === 'completed') {
      // Prevent access to onboarding pages
      if (pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Ensure they go to dashboard (except for allowed routes)
      const allowedPostOnboardingRoutes = [
        '/dashboard',
        '/api',
        '/profile',
        '/settings',
        '/business',
        '/products',
        '/orders',
        '/analytics'
      ]
      
      const isAllowedRoute = allowedPostOnboardingRoutes.some(route => pathname.startsWith(route))
      
      if (!isAllowedRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      return NextResponse.next()
    }
    
    // Handle users with pending onboarding
    if (user.onboardingStatus === 'pending') {
      // Force redirect to business information step
      if (!pathname.startsWith('/onboarding/business-info')) {
        return NextResponse.redirect(new URL('/onboarding/business-info', request.url))
      }
      
      return NextResponse.next()
    }
    
    // Default case - allow the request
    return NextResponse.next()
    
  } catch (error) {
    console.error('Onboarding guard error:', error)
    // On error, be permissive to avoid blocking legitimate users
    return NextResponse.next()
  }
}