
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, ShoppingBag, Send, Users, Flame, User } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { CurrencyDisplay } from '@/shared/components/CurrencyDisplay';
import { PageTransition } from '@/shared/components/PageTransition';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    type: 'CHAT' | 'BID' | 'SYSTEM';
}

export default function LiveCommercePage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [viewerCount, setViewerCount] = useState(1240);
    const [currentBid, setCurrentBid] = useState(45.00);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Mock incoming events
    useEffect(() => {
        const interval = setInterval(() => {
            const random = Math.random();
            if (random > 0.7) {
                // New Chat
                addMessage({
                    id: Date.now().toString(),
                    user: `user_${Math.floor(Math.random() * 1000)}`,
                    text: ['Amazing!', 'Need this', 'Next item pls', '🔥', 'Is it organic?'][Math.floor(Math.random() * 5)],
                    type: 'CHAT'
                });
            } else if (random > 0.9) {
                // New Bid
                const newBid = currentBid + 5;
                setCurrentBid(newBid);
                addMessage({
                    id: Date.now().toString(),
                    user: `bidder_${Math.floor(Math.random() * 100)}`,
                    text: `placed a bid of $${newBid}`,
                    type: 'BID'
                });
            } else {
                // Viewer fluctuation
                setViewerCount(prev => prev + Math.floor(Math.random() * 5 - 2));
            }
        }, 800);
        return () => clearInterval(interval);
    }, [currentBid]);

    const addMessage = (msg: ChatMessage) => {
        setMessages(prev => [...prev.slice(-20), msg]); // Keep last 20
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input) return;
        addMessage({ id: Date.now().toString(), user: 'You', text: input, type: 'CHAT' });
        setInput('');
    };

    const handleBid = () => {
        const newBid = currentBid + 5;
        setCurrentBid(newBid);
        addMessage({ id: Date.now().toString(), user: 'You', text: `placed a bid of $${newBid}`, type: 'BID' });
    };

    return (
        <PageTransition>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 overflow-hidden">
                {/* Main Video Area */}
                <div className="flex-1 bg-background-dark rounded-3xl relative overflow-hidden group border border-border-subtle">
                    {/* Mock Video Stream Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background-dark/20 via-transparent to-background-dark/80 z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2787&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-10000 ease-linear"
                        alt="Live Stream"
                    />

                    {/* Overlays */}
                    <div className="absolute top-6 left-6 z-20 flex gap-3">
                        <Badge variant="error" className="animate-pulse shadow-lg shadow-red-500/20">LIVE</Badge>
                        <div className="bg-background-dark/60 backdrop-blur-md text-text-main px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold border border-white/10">
                            <Users size={12} /> {viewerCount.toLocaleString()}
                        </div>
                    </div>

                    {/* Featured Product Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-96 bg-background-card/80 backdrop-blur-md border border-border-subtle p-4 rounded-2xl z-20">
                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-background-subtle rounded-xl overflow-hidden border border-border-subtle">
                                <img src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=60" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-text-main">
                                <h3 className="font-bold line-clamp-1">Limited Gold Edition Coffee</h3>
                                <p className="text-xs text-text-muted mb-2">Only 5 left at this price</p>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 font-bold" onClick={handleBid}>
                                        Bid ${currentBid + 5}
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-border-subtle text-text-main hover:bg-background-subtle">
                                        <ShoppingBag size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Chat & Bids */}
                <div className="w-full lg:w-96 bg-background-card rounded-3xl flex flex-col border border-border-subtle overflow-hidden">
                    <div className="p-4 border-b border-border-subtle bg-background-subtle">
                        <h2 className="font-black text-lg flex items-center gap-2 text-text-main">
                            <Flame className="text-accent" /> Live Chat
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-sm ${msg.type === 'BID' ? 'bg-primary/10 border border-primary/20 p-2 rounded-lg' : ''}`}
                            >
                                <p className="font-bold inline mr-2 text-xs opacity-70 text-text-subtle">
                                    {msg.user}
                                </p>
                                <span className={msg.type === 'BID' ? 'font-bold text-primary' : 'text-text-main'}>
                                    {msg.text}
                                </span>
                            </motion.div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-border-subtle bg-background-card">
                        <div className="flex justify-center gap-4 mb-4">
                            <button className="p-3 bg-danger/10 text-danger rounded-full hover:scale-110 transition-transform"><Heart fill="currentColor" size={24} /></button>
                            <button className="p-3 bg-primary/10 text-primary rounded-full hover:scale-110 transition-transform"><Share2 size={24} /></button>
                        </div>
                        <form onSubmit={handleSend} className="relative">
                            <input
                                className="w-full bg-background-subtle rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 ring-primary/20 text-text-main placeholder-text-muted"
                                placeholder="Say something..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-text-inverse rounded-full hover:bg-primary-light">
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

// Helper for random user colors
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}
