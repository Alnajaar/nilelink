import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/FirebaseAuthProvider';
import { useEffect } from 'react';

export const useAuthGuard = (requiredRoles?: string[]) => {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return; // Wait for auth to load

        if (!user) {
            // Not authenticated, redirect to login
            router.push('/login');
            return;
        }

        if (requiredRoles && !requiredRoles.includes(user.role)) {
            // User doesn't have required role
            router.push('/');
            return;
        }
    }, [user, loading, requiredRoles, router]);

    return { user, loading, isAuthorized: !!user && (!requiredRoles || requiredRoles.includes(user.role)) };
};

export const checkAuthStatus = () => {
    if (typeof window === 'undefined') return null;
    
    try {
        const userJson = localStorage.getItem('nilelink_current_user');
        const token = localStorage.getItem('nilelink_auth_token');
        
        if (userJson && token) {
            return JSON.parse(userJson);
        }
    } catch (e) {
        console.error('Failed to check auth status:', e);
    }
    
    return null;
};
