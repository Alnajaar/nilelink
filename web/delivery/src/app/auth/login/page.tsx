"use client";

import { useRouter } from 'next/navigation';
import LoginPage from '@/shared/components/auth/LoginPage';

export default function DeliveryLoginPage() {
    const router = useRouter();

    return (
        <LoginPage
            appName="Fleet Courier"
            onLoginSuccess={() => router.push('/driver/home')}
        />
    );
}
