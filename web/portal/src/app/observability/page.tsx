'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { UniversalHeader } from '@shared/components/UniversalHeader';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import AuthGuard from '@shared/components/AuthGuard';

const NeuralMesh = dynamic(() => import('@shared/components/NeuralMesh').then(mod => mod.NeuralMesh), { ssr: false });
const PlanetaryHUD = dynamic(() => import('@/components/observability/PlanetaryHUD'), { ssr: false });

export default function ObservabilityPage() {
    return (
        <AuthGuard appName="NileLink Global Observability" useWeb3Auth={true}>
            <div className="min-h-screen bg-neutral text-text-primary flex flex-col relative overflow-hidden mesh-bg">
                <NeuralMesh />
                <UniversalHeader
                    appName="Observability"
                    user={{ name: "Systems Admin #1", role: "Protocol Engineer" }}
                />

                <main className="flex-1 relative z-10 max-w-[1700px] mx-auto w-full p-8 pt-12">
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase italic">
                                Planetary <span className="text-white/30 truncate">Health</span> Console.
                            </h1>
                            <p className="text-lg text-white/40 font-medium tracking-wide max-w-2xl uppercase">
                                Global Cluster Oversight & Crisis Engineering Hub.
                            </p>
                        </div>
                        <div className="flex gap-4 mb-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Heat</span>
                                <span className="text-xl font-bold text-emerald-500 font-mono">OPTIMAL</span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Network Load</span>
                                <span className="text-xl font-bold text-white font-mono">24.2 TB/s</span>
                            </div>
                        </div>
                    </div>

                    <PlanetaryHUD />
                </main>

                <UniversalFooter />
            </div>
        </AuthGuard>
    );
}
