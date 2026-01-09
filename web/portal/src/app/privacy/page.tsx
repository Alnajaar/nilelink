'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-primary-dark mb-4">Privacy Policy</h1>
                <p className="text-text-muted mb-8">Effective Date: December 26, 2025</p>

                <div className="prose prose-lg max-w-none">
                    <h2>1. Information We Collect</h2>
                    <p>NileLink collects minimal information necessary to provide our services. This includes:</p>
                    <ul>
                        <li>Transaction data (amounts, timestamps, merchant IDs)</li>
                        <li>Wallet addresses (public keys only)</li>
                        <li>Device information for fraud prevention</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>Your data is used exclusively to:</p>
                    <ul>
                        <li>Process transactions on the NileLink network</li>
                        <li>Prevent fraud and ensure security</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <h2>3. Data Storage</h2>
                    <p>
                        All transaction data is stored on an immutable, decentralized ledger. Personal identifiable information is encrypted and stored in compliance with GDPR and CCPA regulations.
                    </p>

                    <h2>4. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your data</li>
                        <li>Request data deletion (where legally permissible)</li>
                        <li>Opt-out of non-essential data collection</li>
                    </ul>

                    <h2>5. Contact Us</h2>
                    <p>
                        For privacy-related inquiries, contact us at: <a href="mailto:privacy@nilelink.app" className="text-primary hover:underline">privacy@nilelink.app</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
