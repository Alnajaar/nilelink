'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Unified Registration & Onboarding Redirect
 * Replaced by the master enrollment flow at /onboarding
 */
export default function RegisterLayout() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/onboarding');
    }, [router]);

    return (
        <div className="min-h-screen bg-pos-bg-primary flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-pos-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );
}