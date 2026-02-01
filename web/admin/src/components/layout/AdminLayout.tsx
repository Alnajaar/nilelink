'use client';

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { DeepSpaceBackground } from '@shared/components/DeepSpaceBackground';
import { motion, AnimatePresence } from 'framer-motion';

import { NotificationProvider } from '../notifications/NotificationContext';
import { AIAssistant } from '../ai/AIAssistant';

export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <div className="min-h-screen bg-[#02050a] text-white selection:bg-blue-500/30">
                {/* The Unified Background */}
                <DeepSpaceBackground />

                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content Area */}
                <div className="pl-64 flex flex-col min-h-screen relative z-10">
                    <AdminTopbar />

                    <main className="flex-1 p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {/* Optional: Simple Footer or bottom status bar */}
                    <footer className="px-8 py-6 border-t border-white/5 text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] flex justify-between items-center">
                        <span>© 2026 NILELINK PROTOCOL • v1.0.4-governance</span>
                        <div className="flex gap-6">
                            <span className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</span>
                            <span className="hover:text-blue-400 cursor-pointer transition-colors">Security Audit</span>
                            <span className="hover:text-blue-400 cursor-pointer transition-colors">Node Health</span>
                        </div>
                    </footer>
                </div>
                <AIAssistant />
            </div>
        </NotificationProvider>
    );
}
