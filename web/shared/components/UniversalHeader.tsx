"use client";

import { useDemo } from '../contexts/DemoContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useWallet } from '../contexts/WalletContext';
import { getSimulatedTPS, getSimulatedBlockHeight } from '../utils/demo-simulator';
import { Coins, Globe, RefreshCw, Wallet, Activity, Cpu, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { AppSwitcher } from './AppSwitcher';
import { StateIndicator } from './StateIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { CommandConsole } from './CommandConsole';

const ProtocolHUD = () => {
    const { isDemoMode, simulatedState } = useDemo() as any;

    if (!isDemoMode || !simulatedState) return null;

    return (
        <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 bg-black/5 rounded-full border border-black/5 font-mono text-[9px] uppercase tracking-widest text-text-muted">
            <div className="flex items-center gap-2">
                <Activity size={10} className="text-secondary animate-pulse" />
                <span>TPS: <span className="text-text-primary font-bold">{Math.round(simulatedState.tps)}</span></span>
            </div>
            <div className="w-px h-3 bg-border-subtle" />
            <div className="flex items-center gap-2">
                <Activity size={10} className="text-primary" />
                <span>Block: <span className="text-text-primary font-bold">{simulatedState.blockHeight.toLocaleString()}</span></span>
            </div>
        </div>
    );
};

const CurrencyControls = () => {
    const { localCurrency, exchangeRate, useLocalCurrency, toggleCurrencyMode, setExchangeRate, setLocalCurrency } = useCurrency();
    const [rateInput, setRateInput] = useState(exchangeRate.toString());

    const handleSaveRate = () => {
        const newRate = parseFloat(rateInput);
        if (!isNaN(newRate) && newRate > 0) {
            setExchangeRate(newRate);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleCurrencyMode}
                className={`h-8 font-mono text-[10px] font-black uppercase tracking-wider ${useLocalCurrency ? 'text-secondary bg-secondary/5 border border-secondary/10' : 'text-text-muted hover:text-text-primary'}`}
            >
                {useLocalCurrency ? localCurrency : 'USD'}
            </Button>

            <div className="relative group">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-text-muted hover:text-primary">
                    <Globe size={14} />
                </Button>

                <div className="absolute right-0 top-full mt-2 w-64 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <Coins size={12} className="text-primary" /> Financial Context
                    </h4>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted">1 USD =</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={rateInput}
                                    onChange={(e) => setRateInput(e.target.value)}
                                    className="w-20 h-8 text-right bg-black/5 border border-transparent rounded-lg px-2 text-xs font-mono focus:border-primary/30 outline-none transition-all"
                                />
                                <span className="font-bold text-text-primary">{localCurrency}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-black/5">
                            <select
                                value={localCurrency}
                                onChange={(e) => setLocalCurrency(e.target.value as any)}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-muted outline-none cursor-pointer hover:text-primary transition-colors"
                            >
                                {['AED', 'SAR', 'EGP', 'KES', 'NGN', 'ZAR', 'EUR', 'GBP'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <Button size="sm" onClick={handleSaveRate} className="h-7 px-3 text-[9px] font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20">
                                Apply
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface UniversalHeaderProps {
    appName?: string;
    links?: { href: string; label: string }[];
    user?: {
        name: string;
        role: string;
        avatar?: string;
    };
    onLogin?: () => void;
    onLogout?: () => void;
    status?: 'online' | 'offline' | 'syncing' | 'error';
    lastSynced?: string;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
    appName,
    links,
    user,
    onLogin,
    onLogout,
    status: propStatus,
    lastSynced
}) => {
    let auth;
    try {
        auth = useAuth();
    } catch {
        // AuthProvider not available, use fallback
        auth = { user: null, logout: () => {} };
    }
    const networkStatus = useNetworkStatus();
    const status = propStatus || networkStatus;
    const { wallet: walletState, connectWallet } = useWallet();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentUser = user || auth?.user;
    const handleLogout = onLogout || auth?.logout || (() => {});

    const wallet = {
        isSupported: true,
        connect: () => connectWallet(), // Fix: Ensure no event object is passed
        isConnecting: walletState.isConnecting,
        isConnected: walletState.isConnected
    };

    // Prevent hydration mismatch by identifying loading state
    const showUser = mounted && currentUser;
    const showWallet = mounted && !currentUser && wallet.isSupported;

    return (
        <>
            <CommandConsole />
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-white/60 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="h-10 w-10 flex items-center justify-center group">
                                <img
                                    src="/shared/assets/logo/logo-square.png"
                                    alt="NileLink"
                                    className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500 shadow-2xl rounded-lg"
                                />
                            </Link>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <AppSwitcher />
                                    {appName && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-border-subtle" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-primary italic">
                                                {appName}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {links && links.length > 0 && (
                            <nav className="hidden lg:flex items-center gap-6 ml-4 border-l border-white/10 pl-8">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        )}
                    </div>

                    {/* Desktop Controls */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                            className="p-3 rounded-xl bg-black/5 text-text-muted hover:text-primary hover:bg-black/10 transition-all border border-transparent hover:border-black/5 group"
                        >
                            <Search size={16} className="group-hover:scale-110 transition-transform" />
                        </button>
                        {mounted && <ProtocolHUD />}

                        <div className="flex items-center gap-4">
                            {mounted && <CurrencyControls />}
                            <div className="w-px h-6 bg-white/10" />
                            <StateIndicator status={status} lastSynced={lastSynced} />

                            {showUser ? (
                                <div className="flex items-center gap-4 ml-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-primary leading-none">
                                            {('name' in currentUser ? currentUser.name : '') ||
                                                ('firstName' in currentUser && 'lastName' in currentUser && currentUser.firstName && currentUser.lastName
                                                    ? `${currentUser.firstName} ${currentUser.lastName}`
                                                    : ('firstName' in currentUser ? currentUser.firstName : '') ||
                                                    ('email' in currentUser ? currentUser.email : '') || 'Member')}
                                        </p>
                                        <p className="text-[8px] text-text-muted font-mono tracking-tighter mt-1">{currentUser.role}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-error hover:bg-error/5"
                                    >
                                        Exit
                                    </Button>
                                </div>
                            ) : showWallet ? (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={wallet.connect}
                                    disabled={wallet.isConnecting}
                                    className="h-10 px-6 text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-background rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {wallet.isConnecting ? (
                                        <>
                                            <RefreshCw size={14} className="mr-2 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet size={14} className="mr-2" />
                                            Protocol Connect
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Link href="/auth/login">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="h-10 px-8 text-[10px] font-black uppercase tracking-widest bg-primary text-background rounded-xl shadow-xl shadow-primary/20"
                                    >
                                        Secure Login
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-text-muted hover:text-primary transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Menu Content */}
                        <div className="absolute right-0 top-0 h-full w-[280px] bg-background-light border-l border-white/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-xs font-black uppercase tracking-widest text-text-muted">Menu</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-text-muted hover:text-error transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6 flex-1 overflow-y-auto">
                                {/* Mobile Navigation Links */}
                                {links && links.length > 0 && (
                                    <nav className="flex flex-col gap-4">
                                        {links.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="text-sm font-bold text-text-primary hover:text-primary transition-colors py-2 border-b border-black/5"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                )}

                                <div className="py-4 border-t border-black/5">
                                    <AppSwitcher />
                                </div>

                                <div className="py-4 border-t border-black/5 flex flex-col gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Settings</span>
                                    {mounted && <CurrencyControls />}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-text-muted">System Status</span>
                                        <StateIndicator status={status} lastSynced={lastSynced} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-black/5">
                                {showUser ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {('name' in currentUser ? currentUser.name : 'U')[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-text-primary">
                                                    {('name' in currentUser ? currentUser.name : 'User')}
                                                </span>
                                                <span className="text-[10px] text-text-muted uppercase">{currentUser.role}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full justify-center text-error hover:bg-error/5"
                                        >
                                            Log Out
                                        </Button>
                                    </div>
                                ) : showWallet ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            wallet.connect();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        disabled={wallet.isConnecting}
                                        className="w-full justify-center h-10 font-bold uppercase tracking-wider"
                                    >
                                        {wallet.isConnecting ? 'Syncing...' : 'Connect Wallet'}
                                    </Button>
                                ) : (
                                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full justify-center h-10 font-bold uppercase tracking-wider"
                                        >
                                            Secure Login
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};
