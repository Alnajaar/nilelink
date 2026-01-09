"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Mail, Phone, MapPin, Send,
    Zap, MessageCircle, Clock,
    CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { api } from '@shared/utils/api';

interface FormData {
    name: string;
    email: string;
    company: string;
    message: string;
    category: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        company: '',
        message: '',
        category: 'GENERAL'
    });

    const [status, setStatus] = useState<SubmissionStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setErrorMessage('Please enter your name');
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrorMessage('Please enter a valid email address');
            return false;
        }
        if (!formData.message.trim() || formData.message.length < 10) {
            setErrorMessage('Please enter a message with at least 10 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setStatus('error');
            return;
        }

        setStatus('submitting');
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await api.post('/contact/form', formData);

            if (response.success) {
                setStatus('success');
                setSuccessMessage(response.message || 'Thank you for your message! We\'ll get back to you within 24 hours.');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    company: '',
                    message: '',
                    category: 'GENERAL'
                });
            } else {
                setStatus('error');
                setErrorMessage(response.error || 'Failed to send message. Please try again.');
            }
        } catch (error: any) {
            console.error('Contact form submission error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Network error. Please check your connection and try again.');
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (status === 'error' && errorMessage) {
            setErrorMessage('');
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 mesh-bg">
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
                        Contact Us
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter uppercase leading-[0.85] italic mb-8">
                        Let's Talk
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-text opacity-40 leading-relaxed max-w-3xl mx-auto">
                        Questions? Ideas? Just want to chat? We're here and we'd love to hear from you.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    {/* Contact Form */}
                    <Card className="p-10 border-2 border-primary bg-white">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Status Messages */}
                            {status === 'success' && successMessage && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-green-800 font-medium">{successMessage}</p>
                                </div>
                            )}

                            {status === 'error' && errorMessage && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-red-800 font-medium">{errorMessage}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Category
                                </label>
                                <select
                                    className="w-full h-14 px-4 border-2 border-surface rounded-xl focus:border-primary outline-none transition-all font-medium bg-white"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    disabled={status === 'submitting'}
                                >
                                    <option value="GENERAL">General Inquiry</option>
                                    <option value="SUPPORT">Technical Support</option>
                                    <option value="BUSINESS">Business Partnership</option>
                                    <option value="TECHNICAL">Technical Questions</option>
                                    <option value="PARTNERSHIP">Partnership Opportunities</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full h-14 px-4 border-2 rounded-xl outline-none transition-all font-medium ${
                                        status === 'error' && !formData.name.trim()
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-surface focus:border-primary'
                                    }`}
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="John Smith"
                                    disabled={status === 'submitting'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    className={`w-full h-14 px-4 border-2 rounded-xl outline-none transition-all font-medium ${
                                        status === 'error' && (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-surface focus:border-primary'
                                    }`}
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="john@company.com"
                                    disabled={status === 'submitting'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Company (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full h-14 px-4 border-2 border-surface rounded-xl focus:border-primary outline-none transition-all font-medium"
                                    value={formData.company}
                                    onChange={(e) => handleInputChange('company', e.target.value)}
                                    placeholder="Your Company Inc."
                                    disabled={status === 'submitting'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest mb-2">
                                    Message *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all font-medium resize-none ${
                                        status === 'error' && (!formData.message.trim() || formData.message.length < 10)
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-surface focus:border-primary'
                                    }`}
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    placeholder="Tell us how we can help..."
                                    disabled={status === 'submitting'}
                                />
                                <p className="text-xs text-text/60 mt-1">
                                    Minimum 10 characters. Be as detailed as possible.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full h-14 bg-primary text-background font-black uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" size={18} />
                                        Sending Message...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2" size={18} />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <Card className="p-8 border-2 border-surface bg-white">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase mb-2">Email Us</h3>
                                    <p className="text-text opacity-60 mb-2">For general inquiries:</p>
                                    <a href="mailto:hello@nilelink.app" className="text-primary font-bold hover:underline">
                                        hello@nilelink.app
                                    </a>
                                    <p className="text-text opacity-60 mt-4 mb-2">For support:</p>
                                    <a href="mailto:support@nilelink.app" className="text-primary font-bold hover:underline">
                                        support@nilelink.app
                                    </a>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-2 border-surface bg-white">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase mb-2">Live Chat</h3>
                                    <p className="text-text opacity-60 mb-4">
                                        Our team is available 24/7 for quick questions and support.
                                    </p>
                                    <Button className="h-12 px-6 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                                        Start Chat
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-2 border-surface bg-white">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase mb-2">Response Time</h3>
                                    <p className="text-text opacity-60">
                                        We typically respond within 2 hours during business hours,
                                        and within 24 hours on weekends.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* FAQ Quick Links */}
                <Card className="p-12 border-2 border-text bg-gradient-to-br from-white to-surface text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">
                        Looking for Quick Answers?
                    </h2>
                    <p className="text-text opacity-60 mb-8">
                        Check out our documentation or support center for instant help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/docs">
                            <Button className="h-14 px-10 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                                Read Docs
                            </Button>
                        </Link>
                        <Link href="/support">
                            <Button variant="outline" className="h-14 px-10 border-2 border-text font-black uppercase tracking-widest rounded-xl">
                                Visit Support Center
                            </Button>
                        </Link>
                    </div>
                </Card>
            </main>
        </div>
    );
}
