"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page with register mode
        router.push('/auth/login?mode=register');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <p>Redirecting to registration...</p>
            </div>
        </div>
    );
}