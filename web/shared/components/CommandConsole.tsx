import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Command, X, ArrowRight, Zap, Brain,
    Truck, ShoppingCart, Shield, Layout, Settings,
    Database, Activity, Globe, MousePointer2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
    id: string;
    title: string;
    description: string;
    icon: any;
    category: 'Navigation' | 'Actions' | 'Intelligence' | 'Tactical';
    action: () => void;
    shortcut?: string;
}

export const CommandConsole: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const commands: CommandItem[] = [
        { id: 'dash', title: 'Go to Dashboard', description: 'Institutional overview & analytics', icon: Layout, category: 'Navigation', action: () => router.push('/dashboard'), shortcut: 'G D' },
        { id: 'pos', title: 'Open POS Terminal', description: 'Launch point-of-sale interface', icon: ShoppingCart, category: 'Navigation', action: () => window.location.href = 'http://localhost:3002/terminal', shortcut: 'G P' },
        { id: 'fleet', title: 'Fleet Oversight', description: 'Real-time driver & route tracking', icon: Truck, category: 'Navigation', action: () => window.location.href = 'http://localhost:3005/fleet', shortcut: 'G F' },
        { id: 'ai-logs', title: 'View AI Negotiation Logs', description: 'Transparency into agent decisions', icon: Brain, category: 'Intelligence', action: () => router.push('/dashboard?view=ai'), shortcut: 'V A' },
        { id: 'risk', title: 'Security Perimeter', description: 'Monitor real-time fraud signals', icon: Shield, category: 'Tactical', action: () => router.push('/dashboard?view=security'), shortcut: 'V S' },
        { id: 'restock', title: 'Trigger Auto-Restock', description: 'AI-assisted inventory replenishment', icon: Zap, category: 'Actions', action: () => alert('Inventory Agent: Analyzing demand velocity... Order drafted.'), shortcut: 'A R' },
        { id: 'nodes', title: 'Network Status', description: 'Global node health & throughput', icon: Activity, category: 'Tactical', action: () => router.push('/demo'), shortcut: 'V N' },
        { id: 'resilience', title: 'Planetary Health Hub', description: 'Institutional observability & chaos agent', icon: Globe, category: 'Tactical', action: () => router.push('/observability'), shortcut: 'V R' }
    ];

    const filteredCommands = query === ''
        ? commands
        : commands.filter(c =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.description.toLowerCase().includes(query.toLowerCase()) ||
            c.category.toLowerCase().includes(query.toLowerCase())
        );

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        if (e.key === 'Escape') setIsOpen(false);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setActiveIndex(0);
        }
    }, [isOpen]);

    const executeCommand = (cmd: CommandItem) => {
        cmd.action();
        setIsOpen(false);
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-[#020817]/90 border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-8 h-20 border-b border-white/5 bg-white/5">
                            <Search className="w-6 h-6 text-white/20 mr-4" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search protocol commands... (try 'restock' or 'ai')"
                                className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-white placeholder-white/20"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white/20 border border-white/10 px-2 py-1 rounded-lg">ESC to exit</span>
                            </div>
                        </div>

                        {/* Command List */}
                        <div className="max-h-[60vh] overflow-y-auto py-4 custom-scrollbar">
                            {filteredCommands.length > 0 ? (
                                <div className="space-y-1 px-4">
                                    {filteredCommands.map((cmd, idx) => (
                                        <button
                                            key={cmd.id}
                                            onClick={() => executeCommand(cmd)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeIndex === idx ? 'bg-white/10' : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${activeIndex === idx ? 'bg-emerald-500 text-[#020817]' : 'bg-white/5 text-white/40'}`}>
                                                    <cmd.icon size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-white">{cmd.title}</h4>
                                                    <p className="text-[10px] text-white/40 font-medium">{cmd.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {cmd.shortcut && (
                                                    <span className="text-[9px] font-mono text-white/20 hidden group-hover:block">{cmd.shortcut}</span>
                                                )}
                                                <ArrowRight size={16} className={`transition-transform ${activeIndex === idx ? 'translate-x-0 opacity-100 text-emerald-500' : '-translate-x-2 opacity-0'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <Brain className="w-12 h-12 text-white/10 mx-auto mb-4 animate-pulse" />
                                    <p className="text-sm text-white/20 font-black uppercase tracking-widest italic">Intelligence inconclusive. Try another query.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer / Context */}
                        <div className="p-6 border-t border-white/5 bg-white/2 flex items-center justify-between opacity-40">
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2"><MousePointer2 size={10} /> SELECT</span>
                                <span className="flex items-center gap-2"><Command size={10} /> EXECUTE</span>
                            </div>
                            <div className="text-[9px] font-mono text-emerald-500">SYS_COMMAND_ACTIVE // V4.0</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
