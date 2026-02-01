'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Zap, Globe, ArrowLeft, Cpu } from 'lucide-react';
import GlobalNavbar from '@shared/components/GlobalNavbar';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import AuthGuard from '@shared/components/AuthGuard';

export default function ProtocolNodePage() {
    const router = useRouter();

    return (
        <AuthGuard>
            <div className="min-h-screen mesh-bg flex flex-col selection:bg-pos-accent/30 overflow-x-hidden">
                <GlobalNavbar context="pos" variant="transparent" />

                <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="absolute -inset-24 bg-pos-accent/10 blur-[100px] rounded-full animate-pulse" />
                        <div className="w-32 h-32 rounded-[2rem] premium-glass flex items-center justify-center text-pos-accent mb-12 relative z-10 mx-auto">
                            <Cpu size={64} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
                        </div>
                    </motion.div>

                    <div className="max-w-2xl space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full premium-glass border-pos-accent/20 bg-pos-accent/5">
                            <span className="flex h-2 w-2 rounded-full bg-pos-accent animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pos-accent">
                                Ecosystem Link Verified
                            </span>
                        </div>

                        <h1 className="text-display italic leading-none text-white">
                            Node<br />
                            <span className="bg-clip-text text-transparent bg-pos-accent-gradient">Syncing.</span>
                        </h1>

                        <p className="text-xl text-pos-text-secondary font-medium leading-relaxed">
                            This terminal node is currently establishing a high-frequency connection to the NileLink Global Settlement Layer.
                            Digital sovereignty is in progress.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                            {[
                                { icon: Shield, label: "Vault Sync", status: "Active" },
                                { icon: Zap, label: "Flash Link", status: "Buffered" },
                                { icon: Globe, label: "Mesh Net", status: "Awaiting" }
                            ].map((node, i) => (
                                <div key={i} className="premium-card p-6 border-white/5 bg-white/[0.02]">
                                    <node.icon size={20} className="text-pos-accent mx-auto mb-4" />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{node.label}</div>
                                    <div className="text-xs font-black text-pos-accent italic uppercase tracking-[0.2em]">{node.status}</div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12">
                            <button
                                onClick={() => router.back()}
                                className="premium-btn premium-glass px-12 h-20 text-white flex items-center justify-center gap-3 mx-auto hover:bg-pos-accent/10 border-pos-accent/20 transition-all font-black uppercase tracking-[0.2em] text-sm"
                            >
                                <ArrowLeft size={18} />
                                Return to Control
                            </button>
                        </div>
                    </div>
                </main>

                <UniversalFooter />

                <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
            </div>
        </AuthGuard>
    );
}
