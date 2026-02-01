'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@shared/components/AuthForm';

export default function RegisterPage() {
    const [error, setError] = useState('');
    const router = useRouter();

    const handleAuthSuccess = (user: any) => {
        console.log('User registered:', user);
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
                        Join NileLink
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create your customer account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <AuthForm
                    mode="register"
                    appName="Customer"
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                />

                <div className="text-center">
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                        Already have an account? Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
