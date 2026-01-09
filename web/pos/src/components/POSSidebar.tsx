'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutGrid,
    ShoppingCart,
    Table2,
    ChefHat,
    Package,
    History,
    Users,
    CreditCard,
    Settings,
    DollarSign,
    Zap,
    TrendingUp,
    Shield
} from 'lucide-react';

interface POSSidebarProps {
    isOpen: boolean;
}

export const POSSidebar: React.FC<POSSidebarProps> = ({ isOpen }) => {
    const pathname = usePathname();

    const navItems = [
        { label: 'Register', icon: ShoppingCart, href: '/terminal' },
        { label: 'Order Ledger', icon: History, href: '/terminal/requests' },
        { label: 'Floor Plan', icon: Table2, href: '/terminal/tables' },
        { label: 'Kitchen KDS', icon: ChefHat, href: '/terminal/kitchen' },
        { label: 'Analytics', icon: TrendingUp, href: '/terminal/analytics' },
        { label: 'Ledger Audit', icon: Shield, href: '/terminal/reports' },
        { label: 'Inventory', icon: Package, href: '/terminal/inventory' },
        { label: 'Shift Control', icon: DollarSign, href: '/terminal/shift' },
        { label: 'Staff Node', icon: Users, href: '/terminal/staff' },
        { label: 'System', icon: Settings, href: '/terminal/settings' },
    ];

    return (
        <aside
            className={`
                bg-surface border-r border-primary flex flex-col transition-all duration-500 z-40
                ${isOpen ? 'w-72' : 'w-24'}
            `}
        >
            {/* Logo area */}
            <div className={`h-20 flex items-center ${isOpen ? 'px-8' : 'justify-center'} border-b border-primary bg-surface sticky top-0 z-10`}>
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background group-hover:rotate-12 transition-transform duration-300">
                        <Zap size={22} fill="currentColor" />
                    </div>
                    {isOpen && (
                        <div className="flex flex-col">
                            <span className="font-black tracking-tighter text-text text-lg uppercase leading-none">NilePOS</span>
                            <span className="text-[8px] font-black text-primary tracking-[0.3em] uppercase mt-0.5">Economic OS</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 py-8 overflow-y-auto custom-scrollbar">
                <div className="px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`
                                    flex items-center gap-4 px-4 py-4 rounded-[18px] transition-all group relative
                                    ${isActive
                                        ? 'bg-secondary text-white shadow-2xl shadow-primary/20 scale-[1.02]'
                                        : 'text-text-muted hover:bg-background-subtle hover:text-text-main'
                                    }
                                `}
                            >
                                <item.icon
                                    size={20}
                                    className={`${isActive ? 'text-white' : 'text-text-subtle group-hover:text-primary'} transition-colors ${isActive ? 'scale-110' : ''}`}
                                />
                                {isOpen && (
                                    <span className={`font-black uppercase tracking-widest text-[10px] ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}>
                                        {item.label}
                                    </span>
                                )}

                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full"
                                    />
                                )}

                                {!isOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-text-main text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom info */}
            <div className="p-6 border-t border-primary bg-background">
                <div className={`flex flex-col gap-1 ${!isOpen && 'items-center'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {isOpen && <span className="text-[8px] font-black text-text uppercase tracking-[0.2em]">Live Protocol v2.1</span>}
                    </div>
                </div>
            </div>
        </aside>
    );
};
