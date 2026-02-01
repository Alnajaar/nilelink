'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@shared/components/AuthForm';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuthSuccess = (user: any) => {
    console.log('User authenticated:', user);
    // Redirect to home - Provider handles the internal state and persistence
    router.push('/');
  };

  const handleAuthError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to NileLink
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your customer account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <AuthForm
          mode="login"
          appName="Customer"
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
        />

        <div className="text-center">
          <button
            onClick={() => router.push('/auth/register')}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
