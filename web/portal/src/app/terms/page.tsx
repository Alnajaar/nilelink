'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-primary-dark mb-4">Terms of Service</h1>
                <p className="text-text-muted mb-8">Effective Date: December 26, 2025</p>

                <div className="prose prose-lg max-w-none">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using NileLink services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    </p>

                    <h2>2. Use of Services</h2>
                    <p>NileLink provides decentralized infrastructure for commerce. You agree to:</p>
                    <ul>
                        <li>Use services only for lawful purposes</li>
                        <li>Not attempt to disrupt or compromise network security</li>
                        <li>Maintain the security of your wallet and credentials</li>
                    </ul>

                    <h2>3. Transactions</h2>
                    <p>
                        All transactions on the NileLink network are final and irreversible. You are responsible for verifying transaction details before confirmation.
                    </p>

                    <h2>4. Liability</h2>
                    <p>NileLink is provided &quot;as is&quot; without warranties of any kind. We are not liable for:</p>
                    <ul>
                        <li>Loss of funds due to user error</li>
                        <li>Network downtime or service interruptions</li>
                        <li>Third-party integrations or services</li>
                    </ul>

                    <h2>5. Modifications</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of NileLink services constitutes acceptance of updated terms.
                    </p>

                    <h2>6. Contact</h2>
                    <p>
                        For questions about these terms, contact: <a href="mailto:legal@nilelink.app" className="text-primary hover:underline">legal@nilelink.app</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
