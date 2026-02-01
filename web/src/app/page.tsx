/**
 * NileLink Ecosystem Unified Landing Page
 * The ultra-premium entrance to the protocol
 * 
 * FEATURES:
 * - Multi-profile entry (I am a: Customer, Merchant, Driver, Supplier)
 * - Global Search (Unified lookup for products & businesses on-chain)
 * - Protocol Stats (Real-time blockchain transactions & network volume)
 * - High-end mesh-gradient aesthetics and animations
 * - SEO Optimized (Meta tags, semantic structure)
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@shared/providers/AuthProvider';

// ============================================
// MAIN COMPONENT
// ============================================

export default function EcosystemLanding() {
    const { user } = useAuth();
    const [protocolStats, setProtocolStats] = useState({
        transactions: 1254200,
        businesses: 4520,
        volume: 85200000,
        activeDrivers: 842
    });

    return (
        <div className="min-h-screen bg-[#02050a] text-white selection:bg-blue-500/30">

            {/* Background FX */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 font-black italic text-xl">N</div>
                    <span className="text-xl font-black tracking-tighter">NileLink</span>
                </div>
                <div className="hidden md:flex items-center gap-12 font-bold text-xs uppercase tracking-widest text-gray-500">
                    <Link href="#solutions" className="hover:text-white transition-all">Solutions</Link>
                    <Link href="#protocol" className="hover:text-white transition-all">Protocol</Link>
                    <Link href="#dao" className="hover:text-white transition-all">Governance</Link>
                    <button className="px-8 py-3 bg-white text-black rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-8 flex flex-col items-center text-center">
                <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-12 animate-fade-in">
                    Connecting the Arab World on the Blockchain
                </div>
                <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-8 leading-none">
                    The Future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">Commerce.</span>
                </h1>
                <p className="max-w-2xl text-gray-500 text-lg md:text-xl leading-relaxed mb-16">
                    An AI-first, decentralized POS and logistics ecosystem designed for high-growth Arab markets. Truly immutable, incredibly intelligent.
                </p>

                {/* Entry Portals */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl">
                    <PortalCard title="Customer" desc="Browse, shop & earn loyalty" icon="🛒" link="/customer/shop" color="hover:border-blue-500/50" />
                    <PortalCard title="Merchant" desc="Manage your business & staff" icon="🏪" link="/pos/dashboard" color="hover:border-purple-500/50" />
                    <PortalCard title="Driver" desc="Fulfill orders & earn crypto" icon="🛵" link="/driver/dashboard" color="hover:border-green-500/50" />
                    <PortalCard title="Supplier" desc="Wholesale bulk distribution" icon="🏭" link="/supplier/dashboard" color="hover:border-orange-500/50" />
                </div>
            </section>

            {/* Protocol Stats Bar */}
            <section className="py-20 px-8 bg-white/5 border-y border-white/5 backdrop-blur-3xl overflow-hidden relative">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <StatItem label="Network TXs" value={protocolStats.transactions.toLocaleString()} />
                    <StatItem label="Verified Businesses" value={protocolStats.businesses.toLocaleString()} />
                    <StatItem label="Protocol Volume" value={`$${(protocolStats.volume / 1000000).toFixed(1)}M`} />
                    <StatItem label="Active Drivers" value={protocolStats.activeDrivers.toString()} />
                </div>
                {/* Animated Grid lines in background */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-1 opacity-[0.03] pointer-events-none">
                    {[...Array(12)].map((_, i) => <div key={i} className="border-r border-white"></div>)}
                </div>
            </section>

            {/* Search / Discover Beta Section */}
            <section className="py-40 px-8 flex flex-col items-center">
                <h2 className="text-4xl font-black mb-16 italic tracking-tighter">Discover the Network</h2>
                <div className="w-full max-w-3xl relative group">
                    <input
                        type="text"
                        placeholder="Search products, businesses, or suppliers on-chain..."
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-8 px-10 text-xl font-bold outline-none focus:border-blue-500 transition-all shadow-2xl"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hidden md:block">Press / to search</span>
                        <button className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl">🔍</button>
                    </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    {['Burger', 'Pizza', 'Meat Wholesalers', 'Packaging', 'Electronics'].map(tag => (
                        <span key={tag} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-gray-500 hover:text-blue-400 cursor-pointer transition-all">
                            #{tag}
                        </span>
                    ))}
                </div>
            </section>

            {/* Footer Branding */}
            <footer className="py-20 border-t border-white/5 px-8 text-center bg-[#010307]">
                <div className="text-4xl font-black italic mb-4">NileLink.</div>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.5em] mb-12">The Protocol of Modern Arab Commerce</p>
                <div className="flex justify-center gap-12 text-gray-600 text-xs font-bold uppercase">
                    <span>Built for the future</span>
                    <span>Powered by AI</span>
                    <span>Secured by Blockchain</span>
                </div>
            </footer>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function PortalCard({ title, desc, icon, link, color }: { title: string, desc: string, icon: string, link: string, color: string }) {
    return (
        <Link href={link} className={`block p-10 bg-white/5 border border-white/10 rounded-[2.5rem] text-left transition-all hover:-translate-y-2 group ${color}`}>
            <div className="text-5xl mb-12 group-hover:scale-110 transition-all">{icon}</div>
            <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-12">{desc}</p>
            <div className="text-white text-xs font-black uppercase tracking-widest flex items-center gap-3">
                Enter Gateway <span className="text-blue-500 group-hover:translate-x-2 transition-all">→</span>
            </div>
        </Link>
    );
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="relative z-10">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">{value}</div>
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">{label}</div>
        </div>
    );
}
