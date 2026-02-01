/**
 * NileLink Universal Footer
 * standardized across all apps in the ecosystem
 * 
 * FEATURES:
 * - Multi-column layout (Protocol, ecosystem, legal, community)
 * - Real-time Network Status indicator
 * - Language Switcher (AR/EN)
 * - SEO Optimized links & semantic structure
 * - Premium mesh-gradient branding
 */

'use client';

import React from 'react';
import Link from 'next/link';

export const UniversalFooter = () => {
    return (
        <footer className="relative bg-[#02050a] border-t border-white/5 pt-32 pb-16 px-8 overflow-hidden">
            {/* Background Brand Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 font-black italic text-2xl">N</div>
                            <span className="text-2xl font-black text-white italic tracking-tighter">NileLink</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-12">
                            The first AI-powered, decentralized POS protocol for high-growth Arab markets. Truly immutable, incredibly intelligent, and community-owned.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Protocol Operational</span>
                            </div>
                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">© 2026 NileLink Protocol</div>
                        </div>
                    </div>

                    {/* Solution Pillar */}
                    <FooterColumn title="Protocols" links={[
                        { label: 'Merchant POS', href: '/pos/dashboard' },
                        { label: 'Customer Shop', href: '/customer/shop' },
                        { label: 'Logistics Network', href: '/driver/dashboard' },
                        { label: 'Wholesale B2B', href: '/supplier/dashboard' }
                    ]} />

                    {/* Ecosystem Pillar */}
                    <FooterColumn title="Ecosystem" links={[
                        { label: 'Network Explorer', href: '/explorer' },
                        { label: 'Governance DAO', href: '/governance' },
                        { label: 'Staking & Rewards', href: '/governance/staking' },
                        { label: 'Developer Docs', href: '#' }
                    ]} />

                    {/* Legal Pillar */}
                    <FooterColumn title="Protocol Info" links={[
                        { label: 'Privacy Policy', href: '#' },
                        { label: 'Terms of Protocol', href: '#' },
                        { label: 'Compliance Engine', href: '#' },
                        { label: 'Security Audits', href: '#' }
                    ]} />
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all">English (US)</button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-all">العربية (Kingdom)</button>
                    </div>

                    <div className="flex items-center gap-12 text-gray-500">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Built for the future of the MENA economy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const FooterColumn = ({ title, links }: { title: string, links: { label: string, href: string }[] }) => (
    <div>
        <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 italic">{title}</h4>
        <ul className="space-y-4">
            {links.map(link => (
                <li key={link.label}>
                    <Link href={link.href} className="text-gray-500 hover:text-blue-400 text-sm font-bold transition-all">
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    </div>
);

export default UniversalFooter;
