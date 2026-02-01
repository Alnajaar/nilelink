"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Share2, Copy, Twitter, Facebook, Mail,
    QrCode, Link as LinkIcon, Check, ExternalLink,
    MessageSquare, Send
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { auth } from '@shared/providers/FirebaseAuthProvider';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

export default function SharePage() {
    const { user } = useAuth();
    const [referralLink, setReferralLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchShareInfo = async () => {
            if (!user?.uid) return;
            try {
                // Get fresh token for production auth
                const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`; // REQUIRED for production
                }

                // Add userId query param for auth middleware (dev bypass) AND headers (production)
                const response = await fetch(`/api/affiliates/share?userId=${user.uid}`, {
                    headers
                });

                if (response.ok) {
                    const data = await response.json();
                    // Access nested data.data.referralLink
                    const link = data.data?.referralLink || data.referralLink;
                    if (link) {
                        setReferralLink(link);
                    } else {
                        // Fallback using uid if API returns no link
                        setReferralLink(`${window.location.origin}/register?ref=${user.uid}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching share info:', error);
                setReferralLink(`${window.location.origin}/register?ref=${user.uid}`);
            } finally {
                setLoading(false);
            }
        };

        fetchShareInfo();
    }, [user]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareSocial = (platform: string) => {
        const text = "Join me on NileLink! Use my referral link to get started:";
        let url = '';

        switch (platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                break;
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + referralLink)}`;
                break;
        }

        if (url) window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center font-bold text-slate-600">Loading share info...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Share & Earn</h1>
                    <p className="text-slate-600">Invite businesses to NileLink and earn 10% commission on their sales.</p>
                </div>

                <Card className="mb-6 p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LinkIcon className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Your Referral Link</h2>
                        <p className="text-slate-500 text-sm mt-1">Copy this link or share it on social media</p>
                    </div>

                    <div className="flex gap-2 mb-8">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 font-medium truncate">
                            {referralLink}
                        </div>
                        <Button onClick={copyToClipboard} variant={copied ? "success" : "primary"}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => shareSocial('twitter')}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="p-3 bg-sky-100 rounded-full">
                                <Twitter className="w-6 h-6 text-sky-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Twitter</span>
                        </button>
                        <button
                            onClick={() => shareSocial('facebook')}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Facebook className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Facebook</span>
                        </button>
                        <button
                            onClick={() => shareSocial('whatsapp')}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="p-3 bg-green-100 rounded-full">
                                <MessageSquare className="w-6 h-6 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                        </button>
                        <button
                            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="p-3 bg-purple-100 rounded-full">
                                <QrCode className="w-6 h-6 text-purple-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">QR Code</span>
                        </button>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
                    <h3 className="text-lg font-bold mb-4">How it works</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                            <p className="text-blue-50">Share your unique referral link with potential businesses or suppliers.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                            <p className="text-blue-50">They register and start selling their products or services through NileLink.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                            <p className="text-blue-50">You earn a 10% commission on every transaction processed by your referred business.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
