import React from 'react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { UniversalFooter } from '@/shared/components/UniversalFooter';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col antialiased">
            <UniversalHeader appName="Legal" />
            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-black text-text mb-8">Terms of Service</h1>
                <p className="text-sm text-text opacity-60 mb-12 uppercase tracking-widest font-mono">Last Updated: January 1, 2026</p>

                <div className="space-y-12 text-text opacity-80 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the NileLink Protocol, including its interface, smart contracts, and associated applications (collectively, the "Protocol"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Protocol.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">2. Protocol Usage</h2>
                        <p>
                            NileLink is a decentralized economic operating system. You acknowledge that:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>You are solely responsible for the security of your wallet and private keys.</li>
                            <li>Transactions on the blockchain are irreversible.</li>
                            <li>The Protocol is provided "as is", without warranties of any kind.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">3. Risk Disclosure</h2>
                        <p>
                            participation in decentralized finance (DeFi) and tokenized assets involves significant risks, including but not limited to:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Smart contract vulnerabilities or bugs.</li>
                            <li>Regulatory uncertainty in your jurisdiction.</li>
                            <li>Market volatility of digital assets.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">4. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, the NileLink Protocol Foundation and its contributors shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses.
                        </p>
                    </section>
                </div>
            </main>
            <UniversalFooter />
        </div>
    );
}
