"use client";

import React from 'react';
import Link from 'next/link';
import {
    AlertTriangle, Home, RefreshCcw, Mail,
    Zap
} from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';

export default function ErrorPage() {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-neutral text-text-primary selection:bg-primary/20 mesh-bg flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-red-500/10 rounded-full mb-6">
                        <AlertTriangle size={64} className="text-red-500" />
                    </div>
                    <h1 className="text-8xl md:text-9xl font-black text-red-500 mb-4">500</h1>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                        Something Went Wrong
                    </h2>
                    <p className="text-lg text-text-primary opacity-60 mb-8">
                        We're experiencing technical difficulties. Our team has been notified and is working on a fix.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button onClick={handleReload} className="h-14 px-10 bg-primary text-background font-black uppercase tracking-widest rounded-xl">
                        <RefreshCcw className="mr-2" size={18} />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="h-14 px-10 border-2 border-text font-black uppercase tracking-widest rounded-xl">
                            <Home className="mr-2" size={18} />
                            Go Home
                        </Button>
                    </Link>
                </div>

                <Card className="p-8 border-2 border-surface bg-white">
                    <h3 className="text-xl font-black uppercase mb-4">Need Help?</h3>
                    <p className="text-text opacity-60 mb-6">
                        If this problem persists, please contact our support team.
                    </p>
                    <Link href="/contact">
                        <Button className="h-12 px-8 bg-primary text-background font-black uppercase text-[10px] rounded-xl">
                            <Mail className="mr-2" size={16} />
                            Contact Support
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
