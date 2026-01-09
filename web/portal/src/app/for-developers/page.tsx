"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Code, Terminal, GitBranch, ArrowRight,
    CheckCircle, Zap, Globe, Lock, Database, Webhook
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function ForDevelopersPage() {
    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 mesh-bg">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/docs">
                            <Button variant="outline" className="h-12 px-6 border-2 border-text font-black uppercase text-[10px] rounded-xl">
                                Docs
                            </Button>
                        </Link>
                        <Link href="/get-started">
                            <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                                Deploy Node
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        For Developers
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Build On The<br />Protocol
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto mb-12">
                        Edge-first, offline-capable commerce infrastructure. REST APIs, WebSockets, and SDKs for building distributed applications.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/docs">
                            <Button size="lg" className="px-12 py-7 text-lg font-black rounded-2xl">
                                Read Docs
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                        <Link href="/demo">
                            <Button variant="outline" size="lg" className="px-12 py-7 text-lg font-black rounded-2xl">
                                Try Sandbox
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12 italic">Engineering First</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Code, title: "Type-Safe SDK", desc: "Native TypeScript support with auto-generated interfaces and Zod validation." },
                            { icon: Webhook, title: "Streaming Sync", desc: "CRDT-based synchronization with sub-50ms latency over global clusters." },
                            { icon: Database, title: "Local-First Storage", desc: "Embedded PostgreSQL with seamless background replication to the mesh." }
                        ].map((item, i) => (
                            <Card key={i} className="p-10 border-2 border-primary bg-white h-full">
                                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mb-8">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{item.title}</h3>
                                <p className="text-lg text-text opacity-60 leading-relaxed">{item.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Code Example */}
                <div className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-30 mb-4 italic">Implementation</h3>
                            <h2 className="text-4xl font-black uppercase tracking-tighter text-text italic">Zero-Config Integration</h2>
                        </div>
                    </div>
                    <Card className="p-1 border-2 border-text bg-primary overflow-hidden">
                        <div className="bg-primary-700 px-6 py-3 border-b border-text/10 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <span className="text-[10px] font-mono text-white/20">checkout.ts</span>
                        </div>
                        <pre className="font-mono text-sm p-8 text-emerald-400 overflow-x-auto">
                            {`// Standard Node Deployment
import { NileNode } from '@nilelink/sdk';

const node = new NileNode({
  cluster: 'cairo-alpha',
  sync: 'high-frequency'
});

// Atomic Transactional Sync
await node.transactions.execute({
  items: [{ id: 'PRD_842', qty: 1 }],
  metadata: { source: 'terminal_A1' },
  onSync: (status) => console.log('Replicated:', status)
});`}
                        </pre>
                    </Card>
                </div>

                {/* Features */}
                <div className="mb-20">
                    <h2 className="text-4xl font-black text-center mb-12 italic">Developer Ecosystem</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { title: "Deterministic State", desc: "No more race conditions. Every event is verified and ordered by the protocol." },
                            { title: "Real-time Webhooks", desc: "Sub-second event propagation for inventory, sales, and logistics updates." },
                            { title: "Unified GraphQL", desc: "Complex relational queries across your entire distributed node fleet." },
                            { title: "Plugin System", desc: "Extend node functionality with custom WASM logic executed at the edge." }
                        ].map((feature, i) => (
                            <Card key={i} className="p-8 border-2 border-surface bg-white group hover:border-black transition-colors">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center text-text opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-background transition-all">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black uppercase mb-2 tracking-tighter">{feature.title}</h4>
                                        <p className="text-base text-text opacity-60 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <Card className="p-20 border-2 border-text bg-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-6xl font-black uppercase tracking-tighter mb-8 italic italic">
                            Build the future<br />of commerce.
                        </h2>
                        <p className="text-xl text-text opacity-40 mb-12 max-w-2xl mx-auto font-medium">
                            Join our developer beta today. Get early access to the SDK and local-first cloud.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/docs">
                                <Button className="h-16 px-12 bg-primary text-background font-black uppercase tracking-widest rounded-2xl">
                                    Read Documentation
                                </Button>
                            </Link>
                            <Link href="/get-started">
                                <Button variant="outline" className="h-16 px-12 border-2 border-text text-text font-black uppercase tracking-widest rounded-2xl hover:bg-text hover:text-background transition-all">
                                    Request API Key
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
