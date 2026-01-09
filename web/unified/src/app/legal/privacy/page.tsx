import React from 'react';
import { UniversalHeader } from '@/shared/components/UniversalHeader';
import { UniversalFooter } from '@/shared/components/UniversalFooter';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col antialiased">
            <UniversalHeader appName="Legal" />
            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl font-black text-text mb-8">Privacy Policy</h1>
                <p className="text-sm text-text opacity-60 mb-12 uppercase tracking-widest font-mono">Last Updated: January 1, 2026</p>

                <div className="space-y-12 text-text opacity-80 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">1. Data Collection</h2>
                        <p>
                            NileLink prioritizes user privacy. As a decentralized protocol, we minimize data collection.
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>**Public Blockchain Data**: Transactions interacting with our smart contracts are public on the blockchain.</li>
                            <li>**Local Storage**: We may store preferences locally on your device for UI convenience.</li>
                            <li>**Usage Data**: We may collect anonymized telemetry to improve system performance.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">2. No Personal Identification</h2>
                        <p>
                            We do not collect names, addresses, or phone numbers unless explicitly provided for specific off-chain services (e.g., delivery coordination). We do not map wallet addresses to real-world identities without consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">3. Third-Party Services</h2>
                        <p>
                            The Protocol may integrate with third-party services (e.g., RPC providers, IPFS gateways). These services may have their own privacy policies which we serve as a pass-through for.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 text-primary">4. Changes to Policy</h2>
                        <p>
                            We reserve the right to update this policy. Continued use of the Protocol constitutes acceptance of any changes. Governance token holders may vote on significant policy shifts.
                        </p>
                    </section>
                </div>
            </main>
            <UniversalFooter />
        </div>
    );
}
