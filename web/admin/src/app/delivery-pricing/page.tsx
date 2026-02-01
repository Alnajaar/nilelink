'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, MapPin, Settings, Download, Search, Filter, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@shared/components/Button'

interface DeliveryRule {
  id: string
  country: string
  city?: string
  zone?: string
  minDistance: number
  maxDistance: number
  basePrice: number
  pricePerKm: number
  platformCutPct: number
  isActive: boolean
  createdAt: string
}

export default function DeliveryPricingPage() {
    const [rules, setRules] = useState<DeliveryRule[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingRule, setEditingRule] = useState<DeliveryRule | null>(null)

    useEffect(() => {
        fetchDeliveryRules()
    }, [])

    const fetchDeliveryRules = async () => {
        try {
            setIsLoading(true)
            // Mock data for demonstration
            const mockData: DeliveryRule[] = [
                {
                    id: '1',
                    country: 'Lebanon',
                    city: 'Beirut',
                    zone: 'Downtown',
                    minDistance: 0,
                    maxDistance: 5,
                    basePrice: 3.00,
                    pricePerKm: 0.50,
                    platformCutPct: 15,
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    country: 'Lebanon',
                    city: 'Tripoli',
                    minDistance: 0,
                    maxDistance: 10,
                    basePrice: 2.50,
                    pricePerKm: 0.40,
                    platformCutPct: 12,
                    isActive: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    country: 'UAE',
                    city: 'Dubai',
                    zone: 'Downtown',
                    minDistance: 0,
                    maxDistance: 15,
                    basePrice: 5.00,
                    pricePerKm: 0.80,
                    platformCutPct: 18,
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ]
            
            setRules(mockData)
        } catch (error) {
            console.error('Failed to fetch delivery rules:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getRuleStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'text-green-400 bg-green-400/10 border-green-400/20' 
            : 'text-red-400 bg-red-400/10 border-red-400/20'
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Delivery Pricing <span className="text-orange-500">& Rules</span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Configure distance-based delivery pricing and platform cuts</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" /> Export Rules
                    </Button>
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Rule
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-2xl">
                            <Truck className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
                            Active Rules
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">{rules.filter(r => r.isActive).length}</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-2xl">
                            <MapPin className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                            Countries
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">{new Set(rules.map(r => r.country)).size}</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-2xl">
                            <Settings className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                            Avg Platform Cut
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {rules.length > 0 
                            ? (rules.reduce((sum, r) => sum + r.platformCutPct, 0) / rules.length).toFixed(1) + '%'
                            : '0%'
                        }
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-2xl">
                            <Truck className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                            Avg Base Price
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        ${rules.length > 0 
                            ? (rules.reduce((sum, r) => sum + r.basePrice, 0) / rules.length).toFixed(2)
                            : '0.00'
                        }
                    </p>
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
                            placeholder="Search delivery rules..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
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
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Location</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Distance Range</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Base Price</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Price/Km</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Platform Cut</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Created</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        Loading delivery rules...
                                    </td>
                                </tr>
                            ) : rules.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        No delivery rules found
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5">
                                            <div>
                                                <div className="font-bold text-white">{rule.country}</div>
                                                {rule.city && <div className="text-sm text-gray-400">{rule.city}</div>}
                                                {rule.zone && <div className="text-xs text-gray-500">{rule.zone}</div>}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-white">
                                                {rule.minDistance}km - {rule.maxDistance}km
                                            </div>
                                        </td>
                                        <td className="p-5 font-bold text-white">
                                            ${rule.basePrice.toFixed(2)}
                                        </td>
                                        <td className="p-5 text-white">
                                            ${rule.pricePerKm.toFixed(2)}/km
                                        </td>
                                        <td className="p-5">
                                            <span className="font-bold text-orange-400">{rule.platformCutPct}%</span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getRuleStatusColor(rule.isActive)}`}>
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm text-gray-500">
                                            {new Date(rule.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingRule(rule)
                                                        setShowModal(true)
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                                                    disabled={!rule.isActive}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingRule ? 'Edit Delivery Rule' : 'Create Delivery Rule'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="e.g., Lebanon"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="e.g., Beirut"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Min Distance (km)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Max Distance (km)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="5"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Base Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="3.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Price/Km ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="0.50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Platform Cut (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500/50"
                                        placeholder="15"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowModal(false)
                                    setEditingRule(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button>
                                {editingRule ? 'Update Rule' : 'Create Rule'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}