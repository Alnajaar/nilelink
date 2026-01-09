'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    WifiOff,
    Shield,
    BarChart3,
    ArrowRight,
    Globe,
    CheckCircle,
    Zap,
    CreditCard,
    Clock,
    Users
} from 'lucide-react';
import { UniversalHeader } from '@shared/components/UniversalHeader';
import { UniversalFooter } from '@shared/components/UniversalFooter';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/contexts/AuthContext';

export default function PosLandingPage() {
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();
    const { user, logout } = useAuth();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleStartTrial = () => {
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/auth/register');
        }
    };

    const handleConnectWallet = () => {
        router.push('/auth/login?web3=true');
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary flex flex-col antialiased selection:bg-primary/20">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full animate-pulse-slow" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>
            {/* Header */}
            <UniversalHeader
                appName="POS Terminal"
                user={user ? { name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Merchant', role: user.role } : undefined}
                onLogin={() => router.push('/auth/login')}
                onLogout={logout}
                status="online"
            />

            {/* Main Content */}
            <main className="flex-1 relative z-10">
                {/* Status Bar */}
                <div className="bg-white/40 backdrop-blur-md border-b border-border-subtle">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">Nodes Verified</span>
                        </div>
                        <div className="w-px h-4 bg-border-subtle hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Network Health:</span>
                            <span className="text-[10px] font-black uppercase text-secondary">Optimum</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge className="bg-primary/5 text-primary border border-primary/20 font-black px-6 py-2 text-xs uppercase tracking-[0.4em] mb-12">
                                Institutional Commerce OS
                            </Badge>

                            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-text-primary tracking-tighter uppercase leading-[0.85] italic mb-12">
                                The Digital<br />
                                <span className="text-primary">Powerhouse.</span>
                            </h1>

                            <p className="text-xl md:text-2xl font-medium text-text-secondary leading-relaxed max-w-3xl mx-auto mb-16 px-4">
                                Orchestrating global commerce with high-frequency ledger processing,
                                cryptographically secured settlement, and institutional-grade offline resilience.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                                <Button
                                    onClick={handleStartTrial}
                                    size="lg"
                                    className="w-full sm:w-auto min-w-[280px] h-20 bg-primary hover:scale-[1.02] active:scale-[0.98] text-background px-12 text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all"
                                >
                                    {user ? 'Enter Ecosystem' : 'Initialize Enterprise Node'}
                                </Button>
                                {!user && (
                                    <Button
                                        onClick={handleConnectWallet}
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[280px] h-20 border-2 border-primary/20 hover:border-primary text-text-primary px-12 text-sm font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
                                    >
                                        Connect Wallet
                                    </Button>
                                )}
                            </div>

                            <div className="inline-flex items-center gap-4 bg-accent/5 border border-accent/20 rounded-2xl px-6 py-4">
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                <p className="text-xs font-black text-accent uppercase tracking-widest leading-none">
                                    Limited Genesis Deployment • First 10 Merchants
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        {[
                            {
                                icon: WifiOff,
                                title: "Offline Resilience",
                                desc: "Proprietary edge-sync technology. Process high-frequency sales without connectivity, automatically salt-hashed to the mainnet upon reconnection.",
                                color: "text-primary"
                            },
                            {
                                icon: Shield,
                                title: "Trustless Integrity",
                                desc: "Every transaction is an economic event secured by the NileLink Protocol. Immutable, audited, and mathematically verified.",
                                color: "text-secondary"
                            },
                            {
                                icon: BarChart3,
                                title: "Real-time Intelligence",
                                desc: "Hyper-granular telemetry providing instant visibility into your global liquidity, inventory velocity, and node performance.",
                                color: "text-accent"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                            >
                                <Card className="p-10 h-full bg-white border-2 border-border-subtle hover:border-primary/30 hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group">
                                    <div className={`w-16 h-16 rounded-2xl bg-neutral flex items-center justify-center ${feature.color} mb-8 group-hover:bg-primary group-hover:text-background transition-colors`}>
                                        <feature.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary mb-4 uppercase tracking-tighter italic">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed font-medium uppercase text-xs tracking-tight opacity-70 italic">{feature.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Infrastructure Section */}
                    <div className="p-10 md:p-16 rounded-[3rem] bg-white border-2 border-border-subtle mb-32 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                            <Globe size={400} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted text-center mb-16 italic">Global Protocol Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
                            {[
                                { icon: Zap, label: "POS Terminal" },
                                { icon: Globe, label: "Logistics Fleet" },
                                { icon: BarChart3, label: "Marketplace" },
                                { icon: Shield, label: "Supplier Core" },
                                { icon: Users, label: "Governance" },
                                { icon: CreditCard, label: "Treasury" },
                                { icon: CheckCircle, label: "Transparency" },
                                { icon: Clock, label: "Voting" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10 }}
                                    className="flex flex-col items-center text-center group/item"
                                >
                                    <div className="w-20 h-20 bg-neutral rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-transparent group-hover/item:border-primary/20 group-hover/item:bg-white transition-all">
                                        <item.icon size={32} className="text-text-muted group-hover/item:text-primary transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-primary italic opacity-60 group-hover/item:opacity-100">{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Social Proof */}
                    <div className="text-center mb-16">
                        <div className="flex flex-wrap items-center justify-center gap-6 py-6 px-8 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2">
                                <CreditCard size={20} className="text-green-600" />
                                <span className="font-medium text-gray-700">No Credit Card Required</span>
                            </div>
                            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <Globe size={20} className="text-blue-600" />
                                <span className="font-medium text-gray-700">Global Network</span>
                            </div>
                            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <Zap size={20} className="text-yellow-600" />
                                <span className="font-medium text-gray-700">Instant Setup</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <Card className="p-10 md:p-20 bg-primary border-0 rounded-[3rem] relative overflow-hidden group mb-20 shadow-2xl shadow-primary/20">
                        <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                            <Zap size={300} className="text-background" />
                        </div>
                        <div className="relative z-10 text-center max-w-3xl mx-auto">
                            <Badge className="bg-background/10 text-background border border-background/20 font-black px-6 py-2 text-xs uppercase tracking-[0.4em] mb-12">
                                Secure Your Future
                            </Badge>
                            <h3 className="text-4xl md:text-6xl font-black text-background tracking-tighter uppercase leading-none italic mb-12">
                                Ready to Transform<br />Your Economic Reality?
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Button
                                    onClick={handleStartTrial}
                                    size="lg"
                                    className="w-full sm:w-auto h-20 bg-white text-primary hover:scale-[1.05] active:scale-[0.95] px-12 text-sm font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
                                >
                                    Deploy Now
                                    <ArrowRight size={20} className="ml-4" />
                                </Button>
                                <Button
                                    onClick={handleConnectWallet}
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto h-20 border-2 border-white/20 hover:border-white text-white px-12 text-sm font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
                                >
                                    Web3 Auth
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </main >

            {/* Footer */}
            < UniversalFooter />
        </div >
    );
}
