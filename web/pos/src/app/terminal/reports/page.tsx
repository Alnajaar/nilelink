"use client";

import React from 'react';
import {
    FileText,
    Download,
    Printer,
    BarChart3,
    Calendar,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    Shield
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
    const router = useRouter();

    const reportTypes = [
        { title: 'Z-Report', desc: 'Daily settlement summary', icon: FileText, color: 'text-primary' },
        { title: 'X-Report', desc: 'Mid-day shift snapshot', icon: BarChart3, color: 'text-success' },
        { title: 'Audit Trail', desc: 'All ledger state changes', icon: Shield, color: 'text-info' },
        { title: 'VAT Ledger', desc: 'Tax compliance summary', icon: Calendar, color: 'text-warning' },
    ];

    return (
        <div className="p-8 flex flex-col h-full gap-8 bg-background">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <TrendingUp size={22} />
                        </div>
                        <h1 className="text-4xl font-black text-text-main uppercase tracking-tight">Economic Reports</h1>
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs ml-1">Protocol Settlement & Performance Audits</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()} className="font-black uppercase tracking-widest px-4">
                        <ArrowLeft size={16} />
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportTypes.map((report, idx) => (
                    <Card key={idx} className="p-8 rounded-[40px] bg-white border-border-subtle hover:border-primary/20 transition-all group cursor-pointer shadow-sm">
                        <div className={`w-14 h-14 rounded-2xl bg-background-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${report.color}`}>
                            <report.icon size={24} />
                        </div>
                        <h3 className="font-black text-text-main text-sm uppercase tracking-tight mb-1">{report.title}</h3>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">{report.desc}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                <Card className="lg:col-span-2 p-10 rounded-[48px] bg-white border-border-subtle shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-text-main uppercase tracking-tight leading-none italic">Session Summary</h3>
                        <Badge variant="success" className="font-black text-[8px] uppercase">Synced with Mainnet</Badge>
                    </div>

                    <div className="space-y-8">
                        {[
                            { label: 'GROSS ANCHOR VALUE', value: '$12,482.50', status: 'verified' },
                            { label: 'NETWORK FEES', value: '$124.80', status: 'calculated' },
                            { label: 'COUPON REDEMPTIONS', value: '$0.00', status: 'none' },
                            { label: 'VOIDED TRANSACTIONS', value: '2', status: 'audited' },
                        ].map((row, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{row.label}</p>
                                    <Badge variant="info" className="py-0 px-2 text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">{row.status}</Badge>
                                </div>
                                <span className="text-2xl font-black text-text-main font-mono">{row.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-12 border-t-2 border-dashed border-border-subtle flex gap-4">
                        <Button className="flex-1 h-16 rounded-2xl bg-secondary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            <Download size={20} className="mr-2" /> EXPORT PDF
                        </Button>
                        <Button variant="outline" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest">
                            <Printer size={20} className="mr-2" /> PRINT PHYSICAL
                        </Button>
                    </div>
                </Card>

                <Card className="p-10 rounded-[48px] bg-background-subtle border-border-subtle flex flex-col">
                    <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-8">Generated Archives</h3>
                    <div className="space-y-4 flex-1">
                        {[
                            { date: 'DEC 24, 2025', type: 'Z-REPORT', id: 'ARC-7721' },
                            { date: 'DEC 23, 2025', type: 'Z-REPORT', id: 'ARC-7720' },
                            { date: 'DEC 22, 2025', type: 'Z-REPORT', id: 'ARC-7719' },
                            { date: 'DEC 21, 2025', type: 'MONTHLY', id: 'ARC-7700' },
                        ].map((arc, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase mb-0.5">{arc.type}</p>
                                    <p className="font-black text-text-main text-xs uppercase">{arc.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-text-subtle group-hover:text-text-main transition-colors">{arc.id}</span>
                                    <ChevronRight size={14} className="text-text-subtle group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-8 font-black text-[10px] tracking-widest uppercase">VIEW ALL ARCHIVES</Button>
                </Card>
            </div>
        </div>
    );
}
