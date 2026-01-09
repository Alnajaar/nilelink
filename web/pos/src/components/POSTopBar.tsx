'use client';

import React from 'react';
import { User, Store, Clock } from 'lucide-react';
import { Badge } from '@/shared/components/Badge';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface POSTopBarProps {
    staffName: string;
    role: string;
    branchName: string;
}

export const POSTopBar: React.FC<POSTopBarProps> = ({
    staffName,
    role,
    branchName
}) => {
    return (
        <header className="h-16 bg-white/60 backdrop-blur-2xl border-b border-white/5 px-6 flex items-center justify-between shrink-0 z-30">
            <div className="flex items-center gap-8">
                {/* Staff Info */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                        <User size={20} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-widest text-text-primary leading-none">{staffName}</span>
                            <div className="px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                                <span className="text-[8px] font-black uppercase tracking-tighter text-primary">{role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-6 w-px bg-white/10 hidden md:block" />

                {/* Branch Info */}
                <div className="hidden md:flex items-center gap-3">
                    <div className="p-2 bg-black/5 rounded-lg">
                        <Store size={14} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{branchName}</span>
                </div>
            </div>

            <div className="flex items-center gap-8">
                {/* Time */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-black/5 rounded-xl border border-transparent font-mono text-[11px] text-text-primary">
                    <Clock size={14} className="text-secondary" />
                    <span className="font-bold tracking-tighter">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="h-6 w-px bg-white/10 hidden lg:block" />

                {/* Sync Status */}
                <div className="flex items-center gap-2">
                    <OfflineIndicator />
                </div>
            </div>
        </header>
    );
};
