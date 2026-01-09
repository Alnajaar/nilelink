'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { UniversalHeader } from '@shared/components/UniversalHeader';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import AuthGuard from '@shared/components/AuthGuard';

const NeuralMesh = dynamic(() => import('@shared/components/NeuralMesh').then(mod => mod.NeuralMesh), { ssr: false });
const GovernanceRoom = dynamic(() => import('@/components/governance/GovernanceRoom'), { ssr: false });

export default function GovernancePage() {
    return (
        <AuthGuard appName="NileLink Protocol Governance" useWeb3Auth={true}>
            <div className="min-h-screen bg-neutral text-text-primary flex flex-col relative overflow-hidden mesh-bg">
                <NeuralMesh />
                <UniversalHeader
                    appName="Governance"
                    user={{ name: "Strategic Node #42", role: "DAO Delegate" }}
                />

                <main className="flex-1 relative z-10 max-w-[1400px] mx-auto w-full p-8 pt-12">
                    <div className="mb-12">
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                            Strategic Control Center
                        </h1>
                        <p className="text-lg text-white/40 font-medium tracking-wide max-w-2xl">
                            NileLink Protocol Decentralization. Review parameters, vote on operational expansions,
                            and oversee the institutional treasury flow.
                        </p>
                    </div>

                    <GovernanceRoom />
                </main>

                <UniversalFooter />
            </div>
        </AuthGuard>
    );
}
