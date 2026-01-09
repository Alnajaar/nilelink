"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Send, Mail, User, Phone, HelpCircle,
    Zap, MessageCircle, Clock, Shield, LifeBuoy
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { UniversalFooter } from '@shared/components/UniversalFooter';

export default function SupportPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        action: 'General Inference',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/contact/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to send request');
            setSubmitted(true);
        } catch (err) {
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20 mesh-bg">
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-text/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center text-primary shadow-2xl">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black uppercase tracking-tighter">NileLink</span>
                    </Link>
                    <Link href="/get-started">
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <Badge className="bg-primary text-background border-0 font-black px-4 py-1.5 text-[9px] uppercase tracking-[0.3em] mb-6">
                        Support Center
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        How can we<br />help you?
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto">
                        Our dedicated support team is available 24/7 to help you scale your business.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            icon: MessageCircle,
                            title: "Live Chat",
                            desc: "Talk to our team in real-time.",
                            status: "Active"
                        },
                        {
                            icon: Mail,
                            title: "Email Support",
                            desc: "Get a response within 2 hours.",
                            status: "Online"
                        },
                        {
                            icon: LifeBuoy,
                            title: "Documentation",
                            desc: "Find quick answers in our docs.",
                            status: "Available"
                        }
                    ].map((item, i) => (
                        <Card key={i} className="p-8 border-2 border-surface bg-white text-center">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-2">{item.title}</h3>
                            <p className="text-text opacity-60 mb-6">{item.desc}</p>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-bold px-3 py-1">
                                {item.status}
                            </Badge>
                        </Card>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto">
                    <Card className="p-10 md:p-16 border-2 border-primary bg-white">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                    <Zap size={40} fill="currentColor" />
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Message Sent!</h2>
                                <p className="text-xl text-text opacity-60 mb-8">
                                    We've received your request and issued a priority ticket. Our team will contact you shortly.
                                </p>
                                <Button
                                    onClick={() => setSubmitted(false)}
                                    className="px-10 h-14 bg-primary text-background font-black uppercase tracking-widest rounded-xl"
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-text opacity-40 ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text opacity-20" size={20} />
                                            <input
                                                type="text"
                                                required
                                                className="w-full h-14 bg-surface/50 border-2 border-surface rounded-2xl px-12 focus:border-primary outline-none transition-all font-bold"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-text opacity-40 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text opacity-20" size={20} />
                                            <input
                                                type="email"
                                                required
                                                className="w-full h-14 bg-surface/50 border-2 border-surface rounded-2xl px-12 focus:border-primary outline-none transition-all font-bold"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-text opacity-40 ml-1">Phone (Optional)</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text opacity-20" size={20} />
                                            <input
                                                type="tel"
                                                className="w-full h-14 bg-surface/50 border-2 border-surface rounded-2xl px-12 focus:border-primary outline-none transition-all font-bold"
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-text opacity-40 ml-1">Subject</label>
                                        <div className="relative">
                                            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-text opacity-20" size={20} />
                                            <select
                                                className="w-full h-14 bg-surface/50 border-2 border-surface rounded-2xl px-12 focus:border-primary outline-none transition-all appearance-none font-bold text-text"
                                                value={formData.action}
                                                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                            >
                                                <option>General Support</option>
                                                <option>Technical Issue</option>
                                                <option>Billing & Pricing</option>
                                                <option>Feature Request</option>
                                                <option>Partnerships</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-text opacity-40 ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={6}
                                        className="w-full bg-surface/50 border-2 border-surface rounded-3xl p-6 focus:border-primary outline-none transition-all font-bold resize-none"
                                        placeholder="Tell us more about how we can help..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                {error && <p className="text-red-500 font-bold text-center text-sm">{error}</p>}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-primary text-background font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Sending Request...' : (
                                        <>
                                            Send Message <Send size={20} />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>
            </main>
            <UniversalFooter />
        </div>
    );
}
