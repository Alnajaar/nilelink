'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Download, Filter, Search, ChevronDown, CheckCircle, XCircle, Clock, Settings, MapPin, Store } from 'lucide-react';
import { Button } from '@shared/components/Button';

interface CommissionRule {
  id: string;
  businessType: string;
  orderCommissionPct: number;
  deliveryCommissionPct: number;
  isActive: boolean;
  country?: string;
  city?: string;
  zone?: string;
  business?: {
    name: string;
    businessType: string;
  };
}

export default function CommissionsPage() {
    const [activeTab, setActiveTab] = useState('global');
    const [rules, setRules] = useState<CommissionRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchRules();
    }, [activeTab]);

    const fetchRules = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/commissions?type=${activeTab}`);
            const data = await response.json();
            
            if (response.ok) {
                setRules(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch rules:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'global', label: 'Global Rules', icon: Settings },
        { id: 'location', label: 'Location Rules', icon: MapPin },
        { id: 'merchant', label: 'Merchant Overrides', icon: Store }
    ];

    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
            : 'text-red-400 bg-red-400/10 border-red-400/20';
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Revenue Engine <span className="text-blue-500">& Commission Rules</span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Configure platform revenue rules and commission structures</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" /> Export Rules
                    </Button>
                    <Button onClick={() => setShowModal(true)}>
                        <Settings className="w-4 h-4 mr-2" /> Add Rule
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }} 
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-500/20 rounded-2xl">
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                                {rules.filter(r => r.isActive).length} Active
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h3>
                        <p className="text-3xl font-black text-white">{rules.length}</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }} 
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                                Configurable
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                            Business Types
                        </h3>
                        <p className="text-3xl font-black text-white">4</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }} 
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                                Zero Risk
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                            Revenue Protection
                        </h3>
                        <p className="text-3xl font-black text-white">100%</p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search rules..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Active Rules Only</span>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                {activeTab === 'global' && (
                                    <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Business Type</th>
                                )}
                                {activeTab === 'location' && (
                                    <>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Location</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Business Type</th>
                                    </>
                                )}
                                {activeTab === 'merchant' && (
                                    <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Merchant</th>
                                )}
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Order Commission</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Delivery Commission</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={activeTab === 'location' ? 7 : 6} className="p-12 text-center text-gray-500">
                                        Loading commission rules...
                                    </td>
                                </tr>
                            ) : rules.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'location' ? 7 : 6} className="p-12 text-center text-gray-500">
                                        No commission rules found
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors group">
                                        {activeTab === 'global' && (
                                            <td className="p-5 font-bold text-white">{rule.businessType}</td>
                                        )}
                                        {activeTab === 'location' && (
                                            <>
                                                <td className="p-5 text-sm text-gray-300">
                                                    {rule.country}
                                                    {rule.city && `, ${rule.city}`}
                                                    {rule.zone && `, ${rule.zone}`}
                                                </td>
                                                <td className="p-5 text-sm text-gray-300">
                                                    {rule.businessType || 'All Types'}
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'merchant' && (
                                            <td className="p-5">
                                                <div>
                                                    <span className="font-bold text-white">{rule.business?.name || 'Unknown'}</span>
                                                    <div className="text-xs text-gray-500 mt-1">{rule.business?.businessType}</div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-5">
                                            <span className="font-bold text-white">{rule.orderCommissionPct}%</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-bold text-white">{rule.deliveryCommissionPct}%</span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(rule.isActive)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <Settings size={16} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50" disabled={!rule.isActive}>
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-5 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <span className="text-xs text-gray-500">Showing {rules.length} rules</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50" disabled>
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal would go here */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Create Commission Rule</h3>
                        <p className="text-gray-400 mb-6">Commission rule creation form would appear here</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button>
                                Create Rule
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
