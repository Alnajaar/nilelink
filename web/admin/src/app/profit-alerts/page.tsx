'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, XCircle, Search, Filter, Download } from 'lucide-react'
import { Button } from '@shared/components/Button'

interface ProfitAlert {
  id: string
  orderId?: string
  alertType: 'ZERO_PROFIT' | 'NEGATIVE_PROFIT' | 'COMMISSION_BYPASS' | 'SETTLEMENT_ANOMALY'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  message: string
  details?: any
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
}

export default function ProfitAlertsPage() {
    const [alerts, setAlerts] = useState<ProfitAlert[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterSeverity, setFilterSeverity] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        fetchAlerts()
    }, [])

    const fetchAlerts = async () => {
        try {
            setIsLoading(true)
            // In a real implementation, this would call your API
            // const response = await fetch('/api/admin/profit-alerts')
            // const data = await response.json()
            
            // Mock data for demonstration
            const mockData: ProfitAlert[] = [
                {
                    id: '1',
                    orderId: 'order_001',
                    alertType: 'ZERO_PROFIT',
                    severity: 'CRITICAL',
                    message: 'Order order_001 would generate zero platform revenue',
                    details: { orderSubtotal: 25.00, deliveryFee: 3.00, platformRevenue: 0 },
                    resolved: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: '2',
                    alertType: 'COMMISSION_BYPASS',
                    severity: 'HIGH',
                    message: 'Potential commission bypass detected for business_002',
                    details: { businessId: 'business_002', attemptedBypass: true },
                    resolved: false,
                    createdAt: new Date(Date.now() - 7200000).toISOString()
                },
                {
                    id: '3',
                    orderId: 'order_003',
                    alertType: 'SETTLEMENT_ANOMALY',
                    severity: 'MEDIUM',
                    message: 'Unusually large settlement amount: $15,000',
                    details: { ownerId: 'business_003', amount: 15000 },
                    resolved: true,
                    resolvedBy: 'admin_001',
                    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
                    createdAt: new Date(Date.now() - 172800000).toISOString()
                }
            ]
            
            setAlerts(mockData)
        } catch (error) {
            console.error('Failed to fetch alerts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredAlerts = alerts.filter(alert => {
        const severityMatch = filterSeverity === 'all' || alert.severity.toLowerCase() === filterSeverity.toLowerCase()
        const statusMatch = filterStatus === 'all' || 
            (filterStatus === 'resolved' && alert.resolved) || 
            (filterStatus === 'unresolved' && !alert.resolved)
        return severityMatch && statusMatch
    })

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/20'
            case 'HIGH': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
        }
    }

    const getAlertIcon = (alertType: string) => {
        switch (alertType) {
            case 'ZERO_PROFIT': return <AlertTriangle className="w-5 h-5 text-red-400" />
            case 'NEGATIVE_PROFIT': return <XCircle className="w-5 h-5 text-red-400" />
            case 'COMMISSION_BYPASS': return <AlertTriangle className="w-5 h-5 text-orange-400" />
            case 'SETTLEMENT_ANOMALY': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
            default: return <AlertTriangle className="w-5 h-5 text-gray-400" />
        }
    }

    const resolveAlert = async (alertId: string) => {
        // In real implementation, call API to resolve alert
        console.log('Resolving alert:', alertId)
        // Update local state
        setAlerts(alerts.map(alert => 
            alert.id === alertId 
                ? { ...alert, resolved: true, resolvedBy: 'current_admin', resolvedAt: new Date().toISOString() }
                : alert
        ))
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Profit Alerts <span className="text-red-500">& Protection</span>
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm font-medium">Monitor and resolve revenue protection alerts</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" /> Export Alerts
                    </Button>
                    <Button>
                        <CheckCircle className="w-4 h-4 mr-2" /> Run Health Check
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
                        <div className="p-3 bg-red-500/20 rounded-2xl">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                            Critical Alerts
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length}
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-2xl">
                            <AlertTriangle className="w-6 h-6 text-orange-400" />
                        </div>
                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
                            High Priority
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {alerts.filter(a => a.severity === 'HIGH' && !a.resolved).length}
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
                            Unresolved
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {alerts.filter(a => !a.resolved).length}
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-2xl">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                            Resolved
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">
                        {alerts.filter(a => a.resolved).length}
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
                            placeholder="Search alerts..."
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select 
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                            >
                                <option value="all">All Severities</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                            >
                                <option value="all">All Status</option>
                                <option value="resolved">Resolved</option>
                                <option value="unresolved">Unresolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Alert</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Type</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Severity</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Order ID</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Message</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Created</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        Loading alerts...
                                    </td>
                                </tr>
                            ) : filteredAlerts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500">
                                        No alerts found
                                    </td>
                                </tr>
                            ) : (
                                filteredAlerts.map((alert) => (
                                    <tr key={alert.id} className={`hover:bg-white/[0.02] transition-colors ${alert.severity === 'CRITICAL' ? 'bg-red-500/5' : ''}`}>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                {getAlertIcon(alert.alertType)}
                                                <span className="font-mono text-sm text-gray-500">#{alert.id.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm font-bold text-white">{alert.alertType.replace('_', ' ')}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            {alert.orderId ? (
                                                <span className="font-mono text-sm text-blue-400">#{alert.orderId.slice(0, 8)}</span>
                                            ) : (
                                                <span className="text-sm text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-5 max-w-xs">
                                            <div className="text-sm text-white font-medium">{alert.message}</div>
                                            {alert.details && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Details: {JSON.stringify(alert.details).slice(0, 50)}...
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-sm text-gray-500">
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-5">
                                            {alert.resolved ? (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                    <span className="text-xs text-green-400">Resolved</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-xs text-yellow-400">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!alert.resolved && (
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => resolveAlert(alert.id)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm">
                                                    <Search className="w-4 h-4" />
                                                </Button>
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