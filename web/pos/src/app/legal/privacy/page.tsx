'use client';

import React from 'react';
import { Shield, Lock, Eye, Server, RefreshCw } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                        <Shield className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Privacy Policy</h1>
                    <p className="text-slate-500">Last Updated: January 28, 2026 | Version 2.4.0 (Production)</p>
                </div>

                <div className="space-y-12">
                    <section className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-500">
                        <div className="flex items-center mb-6">
                            <Server className="w-6 h-6 text-blue-400 mr-4" />
                            <h2 className="text-2xl font-bold text-white uppercase italic">1. Data Minimization & Privacy</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            NileLink POS operates on a principle of "Privacy by Default." We collect only the minimum data required to process transactions and synchronize the business state. Unlike traditional POS systems, we do not sell your transactional data to third parties.
                        </p>
                        <ul className="space-y-3 list-disc list-inside text-slate-400">
                            <li>Cryptographically secured transaction records</li>
                            <li>Local-first storage with encrypted cloud sync</li>
                            <li>Zero-access staff management architecture</li>
                        </ul>
                    </section>

                    <section className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8">
                        <div className="flex items-center mb-6">
                            <Lock className="w-6 h-6 text-purple-400 mr-4" />
                            <h2 className="text-2xl font-bold text-white uppercase italic">2. Blockchain Transparency</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            Critical business stats and order hashes are anchored to the blockchain for auditability. This data is pseudonymous and does not contain Personally Identifiable Information (PII) of your customers unless explicitly opted-in for loyalty programs.
                        </p>
                    </section>

                    <section className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8">
                        <div className="flex items-center mb-6">
                            <Eye className="w-6 h-6 text-green-400 mr-4" />
                            <h2 className="text-2xl font-bold text-white uppercase italic">3. Your Rights (GDPR/ADGM)</h2>
                        </div>
                        <p className="leading-relaxed">
                            Under international regulations, you retain the right to export your transaction history, request deletion of staff accounts, and audit all data flows through the NileLink Protocol.
                        </p>
                    </section>

                    <div className="p-8 border-t border-slate-800 text-center">
                        <RefreshCw className="w-6 h-6 text-slate-700 mx-auto mb-4 animate-spin-slow" />
                        <p className="text-sm text-slate-600">
                            For privacy inquiries: <span className="text-blue-500">legal@nilelink.app</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
