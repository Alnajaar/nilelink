'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { DollarSign, ArrowUpRight, Clock, CheckCircle, Wallet, Calendar } from 'lucide-react';
import graphService from '@shared/services/GraphService';

export default function PayoutsPage() {
    const { address, isConnected } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [pendingPayout, setPendingPayout] = useState(0);

    useEffect(() => {
        async function fetchEarnings() {
            if (!address) return;
            try {
                setLoading(true);
                // In a real scenario, we'd have a specific query for driver earnings
                // For now, we use the user profile which includes deliveries
                const profile = await graphService.getUserProfile(address);
                if (profile && profile.user && profile.user.deliveries) {
                    const earnings = profile.user.deliveries.map((d: any) => ({
                        id: d.id,
                        amount: parseFloat(d.amountUsd6 || '0') / 1000000,
                        date: new Date(parseInt(d.createdAt) * 1000),
                        status: d.status.toLowerCase(),
                        orderId: d.order?.orderNumber || d.id
                    }));
                    setSettlements(earnings);

                    const total = earnings.reduce((sum: number, e: any) => sum + e.amount, 0);
                    setTotalEarned(total);
                    setPendingPayout(total * 0.82); // Assume 82% is ready for payout, rest is fees/held
                }
            } catch (err) {
                console.error('Failed to fetch earnings:', err);
            } finally {
                setLoading(false);
            }
        }

        if (isConnected && address) {
            fetchEarnings();
        }
    }, [isConnected, address]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Earnings & Payouts</h1>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="p-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-green-100 mb-2">Total Earned</p>
                            <h2 className="text-4xl font-bold mb-4">${totalEarned.toFixed(2)}</h2>
                            <div className="flex items-center gap-2 text-sm text-green-100">
                                <ArrowUpRight className="w-4 h-4" />
                                <span>+12% from last month</span>
                            </div>
                        </div>
                        <DollarSign className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10" />
                    </Card>

                    <Card className="p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-gray-600 mb-2">Available for Payout</p>
                            <h2 className="text-3xl font-bold text-gray-900">${pendingPayout.toFixed(2)}</h2>
                        </div>
                        <Button className="w-full mt-4" disabled={pendingPayout <= 0}>
                            <Wallet className="w-4 h-4 mr-2" />
                            Request Payout to Wallet
                        </Button>
                    </Card>
                </div>

                {/* History */}
                <Card className="overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="text-lg font-bold">Earnings History</h3>
                        <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                    <div className="divide-y">
                        {settlements.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No earnings recorded yet.
                            </div>
                        ) : (
                            settlements.map((item) => (
                                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${item.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Delivery #{item.orderId}</p>
                                            <p className="text-sm text-gray-500">{item.date.toLocaleDateString()} • {item.date.toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">+${item.amount.toFixed(2)}</p>
                                        <Badge variant={item.status === 'delivered' ? 'success' : 'primary'}>
                                            {item.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
