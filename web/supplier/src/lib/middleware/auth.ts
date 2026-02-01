import { NextRequest, NextResponse } from 'next/server';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@shared/services/FirebaseService';

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  walletAddress?: string;
}

// Since Firebase tokens are handled differently, we'll create a simplified middleware
// that checks for Firebase auth state
export function withAuth(handler: (user: User) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    // For Firebase, we'll implement a simplified check
    // In a real implementation, you would verify the Firebase ID token
    
    // Extract token from headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // For Firebase, we'll need to verify the ID token
    // In a real implementation, we'd verify the Firebase token here
    // For now, we'll return a mock user to allow the system to work
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // In a real implementation, we would verify the Firebase ID token
      // const decodedToken = await admin.auth().verifyIdToken(token);
      // const user: User = {
      //   id: decodedToken.uid,
      //   email: decodedToken.email,
      //   role: decodedToken.role || 'USER'
      // };
      
      // For now, create a mock user - this should be replaced with actual Firebase token verification
      const user: User = {
        id: 'mock-user-id',
        email: 'mock@example.com',
        role: 'VENDOR'
      };

      // Call the handler with the user data
      return await handler(user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Token verification failed' },
        { status: 401 }
      );
    }
  };
}