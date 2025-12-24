"use client";

import React, { useState } from 'react';
import {
    Database,
    Search,
    ShieldCheck,
    ShieldAlert,
    Clock,
    ChevronRight,
    Lock,
    RefreshCw,
    Activity
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AuditEngine } from '@/lib/engines/AuditEngine';

export default function LedgerAudit() {
    const [searchQuery, setSearchQuery] = useState('');
    const [auditResult, setAuditResult] = useState<any>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditEngine] = useState(() => new AuditEngine());

    const handleAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        setIsAuditing(true);
        // Artificial delay for "Verification Focus"
        setTimeout(async () => {
            const result = await auditEngine.auditTransaction(searchQuery);
            setAuditResult(result);
            setIsAuditing(false);
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div className="space-y-16">

                <header className="max-w-xl">
                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-6">Ledger Audit.</h1>
                    <p className="text-nile-silver/40 text-lg font-bold italic leading-relaxed">
                        Verify the immutable truth of the NileLink protocol. Enter any event hash to audit its provenance and consensus.
                    </p>
                </header>

                {/* Audit Terminal */}
                <section className="p-12 rounded-[4rem] bg-indigo-900/10 border border-indigo-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <form onSubmit={handleAudit} className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 h-20 bg-black/40 rounded-[2rem] border border-white/5 flex items-center px-8 gap-6 focus-within:border-indigo-500/50 transition-all">
                                <Search size={24} className="text-nile-silver/20" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Enter Transaction / Sequence Hash (e.g. h_a82f)..."
                                    className="bg-transparent border-none focus:outline-none flex-1 font-bold text-lg italic text-white placeholder:text-nile-silver/10"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAuditing}
                                className="h-20 px-12 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-600/30 text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isAuditing ? <RefreshCw size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                                {isAuditing ? 'Auditing...' : 'Verify Truth'}
                            </button>
                        </form>

                        {/* Audit Results */}
                        {auditResult && (
                            <div className="mt-12 p-10 rounded-[3.5rem] bg-black/40 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-8 mb-10">
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${auditResult.valid ? 'bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-red-500 text-white'}`}>
                                        {auditResult.valid ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                                            {auditResult.valid ? 'Protocol Verified' : 'Hash Invalid'}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-nile-silver/20 mt-2 italic">
                                            {auditResult.valid ? 'Event Anchored to Sequence #104,522' : 'No sequence match found in mainnet'}
                                        </p>
                                    </div>
                                </div>

                                {auditResult.valid && auditResult.details && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-nile-silver/20 italic">Timestamp</div>
                                            <div className="text-lg font-bold text-white italic">{new Date(auditResult.details.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-nile-silver/20 italic">Origin Node</div>
                                            <div className="text-lg font-bold text-white italic">{auditResult.details.origin}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-nile-silver/20 italic">Merkle Proof</div>
                                            <div className="text-sm font-mono text-indigo-400 break-all">{auditResult.details.merkleProof}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-nile-silver/20 italic">Consistency</div>
                                            <div className="text-lg font-bold text-emerald-500 italic">100% CONSENSUS</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Ledger Stream */}
                <section className="space-y-10 pb-20">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Protocol Stream</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-nile-silver/20">Live Sync</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { seq: 102452, type: 'Settlement Anchor', hub: 'Cairo_North', hash: 'h_a82f', time: '2s ago' },
                            { seq: 102451, type: 'Supply Event', hub: 'Delta_Main', hash: 'h_b91e', time: '14s ago' },
                            { seq: 102450, type: 'Genesis Pulse', hub: 'Giza_South', hash: 'h_c22a', time: '58s ago' },
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col lg:flex-row items-center justify-between gap-8 group cursor-pointer" onClick={() => setSearchQuery(item.hash)}>
                                <div className="flex items-center gap-8 w-full lg:w-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-nile-silver/20 group-hover:text-indigo-400 transition-colors">
                                        <Lock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black italic text-white uppercase tracking-tight">{item.type}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nile-silver/20">Sequence #{item.seq} • {item.hub}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 w-full lg:w-auto justify-between lg:justify-end">
                                    <div className="font-mono text-[11px] text-indigo-400/40 bg-indigo-400/5 px-4 py-2 rounded-lg border border-indigo-400/10 uppercase italic">
                                        {item.hash}
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <span className="text-[10px] font-black uppercase text-nile-silver/20 italic">{item.time}</span>
                                        <ChevronRight size={20} className="text-nile-silver/10 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
