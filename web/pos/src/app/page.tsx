"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PosHome() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-nile-deep flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-nile-silver/20 border-t-nile-silver rounded-full animate-spin" />
        </div>
    );
}
