"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.push('/admin/tenants');
    }, [router]);
    return null;
}
