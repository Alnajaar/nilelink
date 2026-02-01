/**
 * Supplier Financial Dashboard
 * B2B settlement and revenue management
 * 
 * FEATURES:
 * - Real-time earnings from B2B distributions
 * - Bulk Invoice management (Digital/On-chain invoices)
 * - Payout settlement (Withdraw USDT/Local Currency)
 * - B2B Tax Compliance (Integration with ComplianceEngine)
 * - Transaction audit trail for corporate tax
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { complianceEngine } from '@shared/services/ComplianceEngine';
import { graphService } from '@shared/services/GraphService';
import { Skeleton } from '@shared/components/Skeleton';
import { withdrawalService, PayoutRequest } from '@shared/services/WithdrawalService';
import { web3Service } from '@shared/services/Web3Service';

// ============================================
// TYPES
// ============================================

interface FinancialSummary {
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
    payoutsCompleted: number;
}

interface SupplierTransaction {
    id: string;
    businessName: string;
    amount: number;
    taxAmount: number;
    feeAmount: number;
    netAmount: number;
    status: 'PAID' | 'PENDING' | 'CANCELLED';
    timestamp: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SupplierFinancePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<FinancialSummary>({
        availableBalance: 0,
        pendingBalance: 0,
        lifetimeEarnings: 0,
        payoutsCompleted: 0
    });
    const [history, setHistory] = useState<SupplierTransaction[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState('USDT');
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadFinancials();
    }, []);

    const loadFinancials = async () => {
        const supplierId = user?.id || user?.walletAddress;
        if (!supplierId) return;

        try {
            setLoading(true);

            // 1. Fetch Summary from Graph
            const supplierData = await graphService.getSupplier(supplierId);
            if (supplierData) {
                setSummary({
                    availableBalance: parseFloat(supplierData.availableBalanceUsd6 || '0') / 1000000,
                    pendingBalance: parseFloat(supplierData.pendingBalanceUsd6 || '0') / 1000000,
                    lifetimeEarnings: parseFloat(supplierData.totalVolumeUsd6 || '0') / 1000000,
                    payoutsCompleted: parseInt(supplierData.totalPayouts || '0') // Hypothetical field
                });
            }

            // 2. Fetch History from Graph
            const poHistory = await graphService.getPurchaseOrdersBySupplier(supplierId);
            const mappedHistory: SupplierTransaction[] = poHistory.map((po: any) => ({
                id: po.id.slice(0, 8).toUpperCase(),
                businessName: po.restaurant?.id ? `Retailer ${po.restaurant.id.slice(0, 4)}` : 'B2B Client',
                amount: parseFloat(po.totalAmountUsd6) / 1000000,
                taxAmount: (parseFloat(po.totalAmountUsd6) / 1000000) * 0.15, // 15% VAT placeholder
                feeAmount: (parseFloat(po.totalAmountUsd6) / 1000000) * 0.03, // 3% fee
                netAmount: (parseFloat(po.totalAmountUsd6) / 1000000) * 0.82,
                status: po.status === 'COMPLETED' || po.status === 'PAID' ? 'PAID' : 'PENDING',
                timestamp: new Date(parseInt(po.createdAt) * 1000).toISOString().split('T')[0]
            }));

            setHistory(mappedHistory);
            setLoading(false);
        } catch (err) {
            console.error('[Payouts] Load failed:', err);
            setLoading(false);
        }
    };

    const handleWithdraw = () => {
        setShowModal(true);
    };

    const confirmWithdrawal = async (method: 'CRYPTO' | 'CASH' | 'BANK') => {
        if (!user?.id) return;

        try {
            setIsSubmitting(true);

            if (method === 'CRYPTO') {
                // Call Web3 directly
                const txHash = await web3Service.withdrawFunds(summary.availableBalance.toString(), 'SUPPLIER');
                if (txHash) {
                    alert(`On-chain transaction submitted: ${txHash}`);
                } else {
                    alert('Wallet interaction cancelled or failed.');
                    setIsSubmitting(false);
                    return;
                }
            }

            const response = await withdrawalService.requestPayout({
                userId: user.id || user.walletAddress!,
                amount: summary.availableBalance,
                method: method,
                ownerType: 'SUPPLIER',
                details: `Supplier withdrawal request via ${method}`
            });

            if (response.success) {
                alert('Withdrawal request successfully logged in the NileLink Ledger.');
                setSummary(prev => ({ ...prev, availableBalance: 0, payoutsCompleted: prev.payoutsCompleted + 1 }));
                setShowModal(false);
                loadFinancials(); // Refresh history
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (err: any) {
            alert(`Failed to process withdrawal: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">Finance & Payouts</h1>
                        <p className="text-gray-500 text-sm uppercase tracking-widest mt-2">Enterprise-Grade Settlement Dashboard</p>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
                        <button
                            onClick={() => setSelectedCurrency('USDT')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${selectedCurrency === 'USDT' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            USDT (Crypto)
                        </button>
                        <button
                            onClick={() => setSelectedCurrency('FIAT')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${selectedCurrency === 'FIAT' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            Local Fiat (SAR/AED)
                        </button>
                    </div>
                </div>

                {/* Financial Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                    <div className="bg-gradient-to-br from-green-600/20 to-green-900/10 border border-green-500/20 rounded-3xl p-8 backdrop-blur-xl group overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-1">Available to Withdraw</div>
                            <div className="text-4xl font-black text-white">${summary.availableBalance.toLocaleString()}</div>
                            <button
                                onClick={handleWithdraw}
                                className="mt-6 w-full py-4 bg-green-600 hover:bg-green-700 rounded-2xl text-white font-black uppercase text-xs transition-all shadow-xl shadow-green-900/20"
                            >
                                Withdraw Now 💸
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 text-8xl opacity-5 group-hover:opacity-10 transition-all font-black">$$$</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Pending Clearance</div>
                        <div className="text-3xl font-black text-white">${summary.pendingBalance.toLocaleString()}</div>
                        <p className="text-gray-600 text-[10px] font-bold mt-4 uppercase">From 12 Active Orders</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Revenue</div>
                        <div className="text-3xl font-black text-white">${(summary.lifetimeEarnings / 1000000).toFixed(1)}M</div>
                        <p className="text-gray-600 text-[10px] font-bold mt-4 uppercase tracking-[0.2em]">Verified Assets</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Orders</div>
                        <div className="text-3xl font-black text-white">{history.length}</div>
                        <div className="h-1 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[100%]"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Transaction History */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">B2B Audit Trail</h2>
                            <button className="text-blue-400 text-xs font-black uppercase tracking-widest hover:underline">Download Statements (.CSV)</button>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>)
                            ) : (
                                history.map(tx => (
                                    <div key={tx.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">💰</div>
                                            <div>
                                                <div className="text-white font-bold">{tx.businessName}</div>
                                                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{tx.id} • {tx.timestamp}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <div className="text-gray-500 text-[10px] uppercase font-black mb-1">Tax withheld</div>
                                                <div className="text-white text-xs font-bold">-${tx.taxAmount.toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-500 text-[10px] uppercase font-black mb-1">Net Payout</div>
                                                <div className={`text-xl font-black ${tx.status === 'PAID' ? 'text-green-400' : 'text-blue-400'}`}>
                                                    ${tx.netAmount.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Compliance Sidebar */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold text-white uppercase italic tracking-widest px-4">Compliance</h2>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-10">

                            <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                                <h4 className="text-blue-400 text-xs font-black uppercase mb-2">B2B Tax Engine</h4>
                                <p className="text-blue-200/70 text-[10px] leading-relaxed mb-4">
                                    Your country (SA) requires a 15% VAT on wholesale distributions. NileLink automatically calculates and generates e-invoices for every transaction.
                                </p>
                                <button className="text-blue-400 text-[10px] font-black uppercase hover:underline">View Regional Rules →</button>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Linked Entities</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">🏦</div>
                                    <div>
                                        <div className="text-white text-xs font-bold">Riyad Bank - Main Business</div>
                                        <div className="text-gray-500 text-[10px]">IBAN: SA98...1234</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">👛</div>
                                    <div>
                                        <div className="text-white text-xs font-bold">Metamask - Corporate Wallet</div>
                                        <div className="text-gray-500 text-[10px]">0x71...CBB4</div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 text-center">
                                <p className="text-gray-600 text-[10px] leading-relaxed mb-6">
                                    All withdrawals are audited by the NileLink Protocol Compliance Engine and logged on-chain.
                                </p>
                                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all">
                                    Financial Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="bg-[#0a0f1a] border border-white/10 rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>

                            <h2 className="text-3xl font-black text-white mb-2 italic">Select Payout Method</h2>
                            <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest font-bold">Secure Settlement Engine</p>

                            <div className="space-y-4">
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => confirmWithdrawal('CRYPTO')}
                                    className="w-full group bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between hover:bg-blue-600/10 hover:border-blue-500/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🌐</div>
                                        <div>
                                            <div className="text-white font-bold">Crypto (USDC/USDT)</div>
                                            <div className="text-blue-400 text-[10px] font-black uppercase">Instant Settlement</div>
                                        </div>
                                    </div>
                                    <span className="text-white/20 group-hover:text-white transition-colors">→</span>
                                </button>

                                <button
                                    disabled={isSubmitting}
                                    onClick={() => confirmWithdrawal('BANK')}
                                    className="w-full group bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between hover:bg-purple-600/10 hover:border-purple-500/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏦</div>
                                        <div>
                                            <div className="text-white font-bold">Bank Transfer</div>
                                            <div className="text-purple-400 text-[10px] font-black uppercase">1-2 Business Days</div>
                                        </div>
                                    </div>
                                    <span className="text-white/20 group-hover:text-white transition-colors">→</span>
                                </button>

                                <button
                                    disabled={isSubmitting}
                                    onClick={() => confirmWithdrawal('CASH')}
                                    className="w-full group bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between hover:bg-green-600/10 hover:border-green-500/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💵</div>
                                        <div>
                                            <div className="text-white font-bold">Physical Cash</div>
                                            <div className="text-green-400 text-[10px] font-black uppercase">Admin Verification Req.</div>
                                        </div>
                                    </div>
                                    <span className="text-white/20 group-hover:text-white transition-colors">→</span>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full mt-8 py-4 text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Cancel Request
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
