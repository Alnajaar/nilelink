"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users, Search, Filter, Download,
    ArrowRight, Mail, Calendar, ExternalLink,
    CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '@shared/contexts/AuthContext';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

interface Referral {
    id: string;
    businessName: string;
    contactEmail: string;
    status: 'INVITED' | 'REGISTERED' | 'ACTIVE' | 'COMPLETED';
    commissionRate: number;
    totalCommissionEarned: number;
    createdAt: string;
    lastActivityDate?: string;
}

export default function ReferralsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchReferrals = async () => {
            if (!user?.uid) return;

            try {
                const response = await fetch('/api/affiliates/referrals');
                if (response.ok) {
                    const data = await response.json();
                    setReferrals(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, [user]);

    const filteredReferrals = referrals.filter(ref => {
        const matchesSearch =
            ref.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ref.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || ref.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="success">Active</Badge>;
            case 'REGISTERED':
                return <Badge variant="warning">Registered</Badge>;
            case 'INVITED':
                return <Badge variant="info">Invited</Badge>;
            case 'COMPLETED':
                return <Badge variant="default">Completed</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center font-bold text-slate-600">Loading your referrals...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Referrals</h1>
                        <p className="text-slate-600">Manage and track your referred businesses</p>
                    </div>
                    <Button onClick={() => router.push('/affiliate/share')} variant="primary">
                        Invite New Business
                    </Button>
                </div>

                <Card className="mb-6 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by business name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="INVITED">Invited</option>
                            <option value="REGISTERED">Registered</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReferrals.map((referral) => (
                        <motion.div
                            key={referral.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="h-full hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 rounded-xl">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        {getStatusBadge(referral.status)}
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{referral.businessName}</h3>
                                    <div className="flex items-center text-sm text-slate-500 mb-4">
                                        <Mail className="w-3 h-3 mr-1" />
                                        {referral.contactEmail}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Commission</p>
                                            <p className="text-lg font-bold text-slate-900">${referral.totalCommissionEarned.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Joined</p>
                                            <p className="text-sm font-medium text-slate-900">{new Date(referral.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredReferrals.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No referrals found</h3>
                        <p className="text-slate-500 mt-1">Start sharing your referral link to see businesses here!</p>
                        <Button
                            variant="primary"
                            className="mt-6"
                            onClick={() => router.push('/affiliate/share')}
                        >
                            Share Referral Link
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
