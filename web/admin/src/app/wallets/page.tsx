'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Users, Download, Filter, Search, ChevronDown, CheckCircle, XCircle, Clock, ArrowUpDown } from 'lucide-react'
import { Button } from '@shared/components/Button'

interface WalletBalance {
  id: string
  ownerId: string
  ownerType: string
  currency: string
  balance: number
  pendingBalance: number
  lockedBalance: number
  availableBalance: number
  updatedAt: string
}

export default function WalletsPage() {
    const [wallets, setWallets] = useState<WalletBalance[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterType, setFilterType] = useState('all')
    const [sortBy, setSortBy] = useState('balance')

    useEffect(() => {
        fetchWallets()
    }, [])

    const fetchWallets = async () => {
        try {
            setIsLoading(true)
            // In a real implementation, this would call your API
            // const response = await fetch('/api/admin/wallets')
            // const data = await response.json()
            
            // Mock data for demonstration
            const mockData: WalletBalance[] = [
                {
                    id: '1',
                    ownerId: 'business_001',
                    ownerType: 'BUSINESS',
                    currency: 'USD',
                    balance: 1250.75,
                    pendingBalance: 250.00,
                    lockedBalance: 50.00,
                    availableBalance: 1450.75,
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    ownerId: 'supplier_001',
                    ownerType: 'SUPPLIER',
                    currency: 'USD',
                    balance: 890.30,
                    pendingBalance: 0,
                    lockedBalance: 0,
                    availableBalance: 890.30,
                    updatedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    ownerId: 'platform_001',
                    ownerType: 'PLATFORM',
                    currency: 'USD',
                    balance: 15678.90,
                    pendingBalance: 1200.50,
                    lockedBalance: 300.00,
                    availableBalance: 16579.40,
                    updatedAt: new Date().toISOString()
                }
            ]
            
            setWallets(mockData)
        } catch (error) {
            console.error('Failed to fetch wallets:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredWallets = filterType === 'all' 
        ? wallets 
        : wallets.filter(w => w.ownerType.toLowerCase() === filterType.toLowerCase())

    const sortedWallets = [...filteredWallets].sort((a, b) => {
        if (sortBy === 'balance') return b.balance - a.balance
        if (sortBy === 'available') return b.availableBalance - a.availableBalance
        if (sortBy === 'pending') return b.pendingBalance - a.pendingBalance
        return 0
    })

    const getOwnerTypeColor = (type: string) => {
        switch (type) {
            case 'BUSINESS': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            case 'SUPPLIER': return 'text-green-400 bg-green-400/10 border-green-400/20'
            case 'PLATFORM': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Wallet Management <span className="text-purple-500">& Balances</span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Monitor and manage internal wallet balances</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" /> Export Report
                    </Button>
                    <Button>
                        <Wallet className="w-4 h-4 mr-2" /> Transfer Funds
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
                        <div className="p-3 bg-blue-500/20 rounded-2xl">
                            <Wallet className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                            Total Wallets
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">{wallets.length}</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-2xl">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                            Total Balance
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        ${wallets.reduce((sum, w) => sum + w.balance, 0).toLocaleString()}
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-2xl">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg">
                            Pending
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        ${wallets.reduce((sum, w) => sum + w.pendingBalance, 0).toLocaleString()}
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
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">
                            Entity Types
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {new Set(wallets.map(w => w.ownerType)).size}
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
                            placeholder="Search wallets..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option value="all">All Types</option>
                                <option value="BUSINESS">Business</option>
                                <option value="SUPPLIER">Supplier</option>
                                <option value="PLATFORM">Platform</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                            >
                                <option value="balance">Balance</option>
                                <option value="available">Available</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Wallet ID</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Owner</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Type</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Currency</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Balance</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Pending</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Available</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Last Updated</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-gray-500">
                                        Loading wallets...
                                    </td>
                                </tr>
                            ) : sortedWallets.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-gray-500">
                                        No wallets found
                                    </td>
                                </tr>
                            ) : (
                                sortedWallets.map((wallet) => (
                                    <tr key={wallet.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5 font-mono text-sm text-gray-500">#{wallet.id.slice(0, 8)}</td>
                                        <td className="p-5">
                                            <div className="font-bold text-white">{wallet.ownerId}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getOwnerTypeColor(wallet.ownerType)}`}>
                                                {wallet.ownerType}
                                            </span>
                                        </td>
                                        <td className="p-5 font-bold text-white">{wallet.currency}</td>
                                        <td className="p-5 font-bold text-white">${wallet.balance.toFixed(2)}</td>
                                        <td className="p-5 text-yellow-400">${wallet.pendingBalance.toFixed(2)}</td>
                                        <td className="p-5 font-bold text-green-400">${wallet.availableBalance.toFixed(2)}</td>
                                        <td className="p-5 text-sm text-gray-500">
                                            {new Date(wallet.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <Wallet size={16} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <TrendingUp size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}