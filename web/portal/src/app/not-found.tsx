"use client";

import React from 'react';
import Link from 'next/link';
import {
    FileText, AlertCircle, Download, ExternalLink,
    Zap, Shield, Lock, Eye
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';

export default function Custom404Page() {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/20 mesh-bg flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-primary/10 rounded-full mb-6">
                        <AlertCircle size={64} className="text-primary" />
                    </div>
                    <h1 className="text-8xl md:text-9xl font-black text-primary mb-4">404</h1>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-text opacity-60 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Link href="/">
                        <Button className="h-14 px-10 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/get-started">
                        <Button variant="outline" className="h-14 px-10 border-2 border-text font-black uppercase tracking-widest rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </div>

                <Card className="p-8 border-2 border-surface bg-white text-left">
                    <h3 className="text-xl font-black uppercase mb-4">Popular Pages</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { name: "Get Started", href: "/get-started" },
                            { name: "Documentation", href: "/docs" },
                            { name: "For Business", href: "/for-business" },
                            { name: "Contact Us", href: "/contact" }
                        ].map((link, i) => (
                            <Link key={i} href={link.href} className="p-4 border border-surface rounded-xl hover:border-primary transition-all group">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">{link.name}</span>
                                    <ExternalLink size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
