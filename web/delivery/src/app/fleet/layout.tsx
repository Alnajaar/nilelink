"use client";

import React from 'react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import dynamic from 'next/dynamic';

const NeuralMesh = dynamic(() => import('@/shared/components/NeuralMesh').then(mod => mod.NeuralMesh), {
    ssr: false
});

import AuthGuard from '@shared/components/AuthGuard';

export default function FleetLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole={['FLEET_MANAGER', 'ADMIN', 'SUPER_ADMIN']}>
            <div className="min-h-screen bg-background flex flex-col antialiased selection:bg-primary/20 relative">
                <NeuralMesh />
                <UniversalHeader
                    appName="Fleet Terminal"
                    user={{ name: "Fleet Manager", role: "Regional Oversight" }}
                />
                <main className="flex-1 w-full max-w-[1600px] mx-auto p-8">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
