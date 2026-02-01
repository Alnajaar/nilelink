import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  walletAddress?: string;
}

export function withAuth(handler: (user: User, req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    // Ensure Firebase is initialized
    initAdmin();

    try {
      // 1. Priority: System Authorization Header (Firebase Token)
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // Dynamic import to avoid issues in non-server environments if any
          const { getAuth } = await import('firebase-admin/auth');
          const decodedToken = await getAuth().verifyIdToken(token);

          if (decodedToken) {
            const user: User = {
              id: decodedToken.uid,
              email: decodedToken.email,
              firstName: (decodedToken.name as string)?.split(' ')[0] || '',
              lastName: (decodedToken.name as string)?.split(' ').slice(1).join(' ') || '',
              role: (decodedToken.role as string) || 'CUSTOMER'
            };
            return await handler(user, req);
          }
        } catch (tokenError) {
          console.error('Firebase token verification failed:', tokenError);
          // Don't return yet, fall back to dev bypass if applicable
        }
      }

      // ----------------------------------------------------------------------
      // 2. DEVELOPMENT BYPASS - ONLY ACTIVE IN DEV ENVIRONMENT
      // ----------------------------------------------------------------------
      if (process.env.NODE_ENV !== 'production') {
        const url = new URL(req.url);
        const queryUserId = url.searchParams.get('userId');

        // Bypass A: Query Parameter (Safe, no body consumption)
        if (queryUserId) {
          const user: User = {
            id: queryUserId,
            email: 'dev-user@example.com',
            role: 'CUSTOMER'
          };
          return await handler(user, req);
        }

        // Bypass B: Body Parameter (Use CLONE to avoid consuming original stream)
        try {
          const clonedReq = req.clone();
          const body = await clonedReq.json().catch(() => ({}));
          if (body && body.userId) {
            const user: User = {
              id: body.userId,
              email: body.userEmail || 'dev-body@example.com',
              firstName: body.userName?.split(' ')[0] || 'Dev',
              lastName: body.userName?.split(' ').slice(1).join(' ') || 'User',
              role: 'CUSTOMER'
            };
            return await handler(user, req);
          }
        } catch (e) {
          // Ignore clone/json errors
        }
      }

      // ----------------------------------------------------------------------
      // 3. PRODUCTION FALLBACK (Restrictive)
      // ----------------------------------------------------------------------
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Valid token required' },
          { status: 401 }
        );
      }

      // Final fallback for local dev when no identity is provided
      const guestUser: User = {
        id: 'guest-dev-id',
        email: 'guest@nilelink.dev',
        role: 'CUSTOMER'
      };

      return await handler(guestUser, req);

    } catch (error) {
      console.error('Auth middleware critical failure:', error);
      return NextResponse.json(
        { success: false, error: 'Internal Authentication Error' },
        { status: 500 }
      );
    }
  };
}
