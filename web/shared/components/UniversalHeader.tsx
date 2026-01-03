"use client";

import React from 'react';
import { AppSwitcher } from './AppSwitcher';
import { StateIndicator } from './StateIndicator';
import { Button } from './Button';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useCurrency } from '../contexts/CurrencyContext';
import { Coins, Globe, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const CurrencyControls = () => {
    const { localCurrency, exchangeRate, useLocalCurrency, toggleCurrencyMode, setExchangeRate, setLocalCurrency } = useCurrency();
    const [isEditing, setIsEditing] = useState(false);
    const [rateInput, setRateInput] = useState(exchangeRate.toString());

    const handleSaveRate = () => {
        const newRate = parseFloat(rateInput);
        if (!isNaN(newRate) && newRate > 0) {
            setExchangeRate(newRate);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center gap-2 mr-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleCurrencyMode}
                className={`font-mono text-xs font-bold ${useLocalCurrency ? 'text-secondary bg-secondary/10' : 'text-text-muted hover:text-text-primary'}`}
                title="Toggle Currency Display"
            >
                {useLocalCurrency ? localCurrency : 'USD'}
            </Button>

            <div className="relative group">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-text-muted hover:text-primary">
                    <Globe size={14} />
                </Button>

                {/* Popover for Rate Settings */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border-subtle rounded-xl shadow-xl p-4 hidden group-hover:block hover:block z-50">
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                        <Coins size={12} /> Daily Rate Settings
                    </h4>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-primary font-medium">1 USD =</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={rateInput}
                                    onChange={(e) => setRateInput(e.target.value)}
                                    className="w-16 h-8 text-right bg-neutral border border-border rounded-lg px-2 text-sm font-mono focus:border-primary outline-none"
                                />
                                <span className="font-bold text-xs">{localCurrency}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                            <select
                                value={localCurrency}
                                onChange={(e) => setLocalCurrency(e.target.value as any)}
                                className="bg-transparent text-xs font-medium text-text-muted outline-none cursor-pointer hover:text-primary"
                            >
                                {['AED', 'SAR', 'EGP', 'KES', 'NGN', 'ZAR', 'EUR', 'GBP'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <Button size="sm" onClick={handleSaveRate} className="h-7 text-xs">
                                Save Rate
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
    user,
    onLogin,
    onLogout,
    status: propStatus,
    lastSynced
}) => {
    const networkStatus = useNetworkStatus();
    const status = propStatus || networkStatus;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            <div className="container-nilelink flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        {/* Logo Placeholder - User instructed to put logo in public/logo.png */}
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            N
                        </div>
                        <AppSwitcher />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <CurrencyControls />
                    <StateIndicator status={status} lastSynced={lastSynced} />

                    <div className="h-6 w-px bg-border-subtle mx-2"></div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-text-primary leading-tight">{user.name}</p>
                                <p className="text-xs text-text-muted font-mono mt-0.5">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onLogout} className="text-text-muted hover:text-error">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" size="sm" onClick={onLogin} className="shadow-lg shadow-primary/20">
                            Connect Wallet
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );

};
