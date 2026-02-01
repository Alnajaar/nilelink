'use client';

import React from 'react';
import { Scale, Zap, Globe, AlertTriangle, FileText } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-300 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                        <Scale className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Terms of Service</h1>
                    <p className="text-slate-500">Last Updated: January 28, 2026 | Version 1.9.0 (Institutional)</p>
                </div>

                <div className="space-y-8">
                    <section className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 transition-colors hover:bg-slate-800/40">
                        <div className="flex items-center mb-4">
                            <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                            <h2 className="text-xl font-bold text-white uppercase italic">1. Platform Usage</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            NileLink POS is an institutional-grade Economic Operating System. By using this terminal, you agree to comply with all local commerce regulations and tax laws in your jurisdiction. NileLink provides the technology but does not act as the merchant of record for your transactions.
                        </p>
                    </section>

                    <section className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 transition-colors hover:bg-slate-800/40">
                        <div className="flex items-center mb-4">
                            <Globe className="w-5 h-5 text-blue-400 mr-3" />
                            <h2 className="text-xl font-bold text-white uppercase italic">2. Blockchain Settlement</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            You acknowledge that certain transaction records are finalized on the blockchain. These actions are irreversible once anchored. NileLink is not responsible for errors in wallet configuration or lost private keys for business ownership.
                        </p>
                    </section>

                    <section className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 transition-colors hover:bg-slate-800/40">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                            <h2 className="text-xl font-bold text-white uppercase italic">3. Service Availability</h2>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                            While NileLink provides a 99.9% uptime SLA through decentralized synchronization, we are not liable for business interruptions caused by local hardware failures, ISP connectivity issues, or power outages at your physical branch.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center">
                            <FileText className="w-8 h-8 text-slate-700 mr-4" />
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-widest">Billing Policy</p>
                                <p className="text-[10px] text-slate-500">Last audit: Sep 2025</p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center">
                            <Scale className="w-8 h-8 text-slate-700 mr-4" />
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-widest">Compliance</p>
                                <p className="text-[10px] text-slate-500">ISO 27001 Prepared</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-600 mt-12">
                        Copyright © 2026 NileLink Inc. All rights reserved. Jurisdictional Law of Abu Dhabi Global Market (ADGM) applies.
                    </p>
                </div>
            </div>
        </div>
    );
}
