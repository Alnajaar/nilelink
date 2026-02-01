'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, DollarSign, Download, Search, Filter, Plus, Edit } from 'lucide-react'
import { Button } from '@shared/components/Button'

interface SupplierTier {
  id: string
  minVolume: number
  maxVolume: number | null
  commissionPct: number
  description: string
  isActive: boolean
}

interface SupplierRule {
  id: string
  supplierId: string
  supplierName: string
  commissionPct: number
  tierId?: string
  tierName?: string
  effectiveFrom: string
  effectiveTo?: string
  createdBy: string
}

export default function SupplierCommissionPage() {
    const [tiers, setTiers] = useState<SupplierTier[]>([])
    const [supplierRules, setSupplierRules] = useState<SupplierRule[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('tiers')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchSupplierData()
    }, [])

    const fetchSupplierData = async () => {
        try {
            setIsLoading(true)
            // Mock data for demonstration
            const mockTiers: SupplierTier[] = [
                {
                    id: '1',
                    minVolume: 0,
                    maxVolume: 10000,
                    commissionPct: 8.0,
                    description: 'Starter Tier - Up to $10,000 monthly volume',
                    isActive: true
                },
                {
                    id: '2',
                    minVolume: 10000,
                    maxVolume: 50000,
                    commissionPct: 6.5,
                    description: 'Growth Tier - $10,000-$50,000 monthly volume',
                    isActive: true
                },
                {
                    id: '3',
                    minVolume: 50000,
                    maxVolume: 100000,
                    commissionPct: 5.0,
                    description: 'Premium Tier - $50,000-$100,000 monthly volume',
                    isActive: true
                },
                {
                    id: '4',
                    minVolume: 100000,
                    maxVolume: null,
                    commissionPct: 3.5,
                    description: 'Enterprise Tier - $100,000+ monthly volume',
                    isActive: true
                }
            ]

            const mockRules: SupplierRule[] = [
                {
                    id: '1',
                    supplierId: 'supplier_001',
                    supplierName: 'Fresh Produce Co.',
                    commissionPct: 4.5,
                    tierId: '3',
                    tierName: 'Premium Tier',
                    effectiveFrom: new Date(Date.now() - 86400000).toISOString(),
                    createdBy: 'admin_001'
                },
                {
                    id: '2',
                    supplierId: 'supplier_002',
                    supplierName: 'Bakery Supplies Ltd.',
                    commissionPct: 7.0,
                    tierId: '1',
                    tierName: 'Starter Tier',
                    effectiveFrom: new Date().toISOString(),
                    createdBy: 'admin_001'
                }
            ]
            
            setTiers(mockTiers)
            setSupplierRules(mockRules)
        } catch (error) {
            console.error('Failed to fetch supplier data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const tabs = [
        { id: 'tiers', label: 'Commission Tiers', count: tiers.filter(t => t.isActive).length },
        { id: 'suppliers', label: 'Supplier Overrides', count: supplierRules.length }
    ]

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Supplier Commission <span className="text-green-500">& Tiers</span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Manage supplier commission tiers and individual overrides</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" /> Export Data
                    </Button>
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add {activeTab === 'tiers' ? 'Tier' : 'Override'}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-green-500 text-green-400'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab.label} <span className="text-xs">({tab.count})</span>
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'tiers' ? (
                <div className="space-y-6">
                    {/* Tier Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-500/20 rounded-2xl">
                                    <Users className="w-6 h-6 text-green-400" />
                                </div>
                                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                                    Active Tiers
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white">{tiers.filter(t => t.isActive).length}</p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                                    Avg Commission
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white">
                                {tiers.length > 0 
                                    ? (tiers.reduce((sum, t) => sum + t.commissionPct, 0) / tiers.length).toFixed(1) + '%'
                                    : '0%'
                                }
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-2xl">
                                    <DollarSign className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                                    Highest Tier
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white">
                                ${tiers.length > 0 
                                    ? Math.max(...tiers.map(t => t.maxVolume || 0)).toLocaleString()
                                    : '0'
                                }
                            </p>
                        </motion.div>
                    </div>

                    {/* Tiers Table */}
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                        <div className="p-5 border-b border-white/5">
                            <h3 className="text-lg font-bold text-white">Commission Tiers</h3>
                            <p className="text-sm text-gray-400">Volume-based commission structure for suppliers</p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Tier</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Volume Range</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Commission</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Description</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500">
                                                Loading tiers...
                                            </td>
                                        </tr>
                                    ) : tiers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500">
                                                No commission tiers found
                                            </td>
                                        </tr>
                                    ) : (
                                        tiers.map((tier) => (
                                            <tr key={tier.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-5">
                                                    <div className="font-bold text-white">Tier {tier.id}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-white">
                                                        ${tier.minVolume.toLocaleString()}
                                                        {tier.maxVolume ? ` - $${tier.maxVolume.toLocaleString()}` : '+'}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="font-bold text-green-400">{tier.commissionPct}%</span>
                                                </td>
                                                <td className="p-5 max-w-xs">
                                                    <div className="text-sm text-gray-300">{tier.description}</div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                                        tier.isActive 
                                                            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
                                                            : 'text-red-400 bg-red-400/10 border-red-400/20'
                                                    }`}>
                                                        {tier.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            // Edit tier logic
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Supplier Rules Table */}
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Supplier Overrides</h3>
                                <p className="text-sm text-gray-400">Individual supplier commission rates</p>
                            </div>
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search suppliers..."
                                    className="w-full bg-black/20 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
                                />
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Supplier</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Commission</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Tier</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Effective From</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Set By</th>
                                        <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500">
                                                Loading supplier rules...
                                            </td>
                                        </tr>
                                    ) : supplierRules.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-gray-500">
                                                No supplier overrides found
                                            </td>
                                        </tr>
                                    ) : (
                                        supplierRules.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-5">
                                                    <div className="font-bold text-white">{rule.supplierName}</div>
                                                    <div className="text-sm text-gray-500 font-mono">{rule.supplierId}</div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="font-bold text-green-400">{rule.commissionPct}%</span>
                                                </td>
                                                <td className="p-5">
                                                    {rule.tierName ? (
                                                        <span className="text-sm text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                                            {rule.tierName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Custom</span>
                                                    )}
                                                </td>
                                                <td className="p-5 text-sm text-gray-300">
                                                    {new Date(rule.effectiveFrom).toLocaleDateString()}
                                                </td>
                                                <td className="p-5 text-sm text-gray-300">
                                                    {rule.createdBy}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            // Edit rule logic
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {activeTab === 'tiers' ? 'Create Commission Tier' : 'Create Supplier Override'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === 'tiers' 
                                ? 'Define a new volume-based commission tier'
                                : 'Set custom commission rate for a specific supplier'
                            }
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button>
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}