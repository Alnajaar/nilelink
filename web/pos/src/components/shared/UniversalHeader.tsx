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
        <header className="sticky top-0 z-40 w-full border-b border-border-default/50 bg-background-primary/80 backdrop-blur-3xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <AppSwitcher />
                    {appName && (
                        <>
                            <div className="h-4 w-px bg-black/10 hidden sm:block"></div>
                            <span className="text-sm font-medium text-primary-dark/70 hidden sm:block">{appName}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <StateIndicator status={status} lastSynced={lastSynced} />

                    <div className="h-4 w-px bg-black/10"></div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-primary-dark leading-none">{user.name}</p>
                                <p className="text-xs text-primary-dark/50 mt-1">{user.role}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onLogout}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Button variant="primary" size="sm" onClick={onLogin}>
                            Connect
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};
