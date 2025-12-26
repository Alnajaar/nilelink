"use client";

import React from 'react';
import { AppSwitcher } from './AppSwitcher';
import { StateIndicator } from './StateIndicator';
import { Button } from './Button';
import { useNetworkStatus } from './hooks/useNetworkStatus';

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
        <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container-nilelink flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            N
                        </div>
                        <AppSwitcher />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <StateIndicator status={status} lastSynced={lastSynced} />

                    <div className="h-6 w-px bg-border-subtle mx-2"></div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-text-main leading-tight">{user.name}</p>
                                <p className="text-xs text-text-muted font-mono mt-0.5">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onLogout} className="text-text-subtle hover:text-danger">
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
