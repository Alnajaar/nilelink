'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@shared/components/LoginPage';

export default function POSLoginPage() {
  const router = useRouter();

  return (
    <LoginPage
      appName="NileLink POS"
      onLoginSuccess={() => {
        // After successful Firebase or wallet auth, send user to the POS dashboard
        router.push('/dashboard');
      }}
    />
  );
}
