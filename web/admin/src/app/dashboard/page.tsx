'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users,
    Shield,
    Settings,
    BarChart3,
    Database,
    Server,
    Smartphone,
    Globe,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Activity,
    TrendingUp,
    DollarSign,
    UserCheck,
    UserX
} from 'lucide-react'

export default function AdminDashboard() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [stats, setStats] = useState({
        totalUsers: 0,
        approvedUsers: 0,
        pendingApprovals: 0,
        rejectedUsers: 0,
        activeSessions: 0,
        systemHealth: 'healthy'
    })

    useEffect(() => {
        // Check admin authentication
        const adminSession = localStorage.getItem('admin_session')
        if (!adminSession) {
            router.push('/login')
            return
        }

        try {
            const session = JSON.parse(adminSession)
            if (!session.authenticated) {
                router.push('/login')
                return
            }
            setIsAuthenticated(true)
            loadStats()
        } catch {
            router.push('/login')
        }
    }, [router])

    const loadStats = () => {
        // Load ecosystem statistics
        const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]')
        const approvedUsers = allUsers.filter((u: any) => u.status === 'approved').length
        const pendingApprovals = allUsers.filter((u: any) => u.status === 'pending_approval').length
        const rejectedUsers = allUsers.filter((u: any) => u.status === 'rejected').length

        setStats({
            totalUsers: allUsers.length,
            approvedUsers,
            pendingApprovals,
            rejectedUsers,
            activeSessions: Math.floor(Math.random() * 50) + 10, // Mock
            systemHealth: 'healthy'
        })
    }

    const logout = () => {
        localStorage.removeItem('admin_session')
        router.push('/login')
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-red-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">NileLink Super Admin</h1>
                                <p className="text-sm text-gray-500">Ecosystem Control Panel</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">admin@nilelink.app</span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* System Status */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">API Status</p>
                                    <p className="text-lg font-semibold text-green-600">Healthy</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <Database className="h-8 w-8 text-blue-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Database</p>
                                    <p className="text-lg font-semibold text-blue-600">Connected</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <Server className="h-8 w-8 text-purple-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Blockchain</p>
                                    <p className="text-lg font-semibold text-purple-600">Synced</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <Activity className="h-8 w-8 text-orange-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                                    <p className="text-lg font-semibold text-orange-600">{stats.activeSessions}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Management Stats */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-blue-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approvedUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <UserX className="h-8 w-8 text-red-500 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejectedUsers}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a
                            href="/user-approvals"
                            className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center">
                                <UserCheck className="h-10 w-10 text-green-500 mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">User Approvals</h3>
                                    <p className="text-sm text-gray-600">Review and approve new registrations</p>
                                    {stats.pendingApprovals > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                            {stats.pendingApprovals} pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        </a>

                        <a
                            href="/users"
                            className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center">
                                <Users className="h-10 w-10 text-blue-500 mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                                    <p className="text-sm text-gray-600">Add, edit, and manage all users</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="/subscriptions"
                            className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center">
                                <DollarSign className="h-10 w-10 text-green-500 mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
                                    <p className="text-sm text-gray-600">Manage pricing and plans</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="/settings"
                            className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center">
                                <Settings className="h-10 w-10 text-gray-500 mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                                    <p className="text-sm text-gray-600">Configure ecosystem parameters</p>
                                </div>
                            </div>
                        </a>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <BarChart3 className="h-10 w-10 text-purple-500 mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                                    <p className="text-sm text-gray-600">View ecosystem performance metrics</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center">
                                <Shield className="h-10 w-10 text-red-500 mr-4" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                                    <p className="text-sm text-gray-600">Audit logs and access control</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ecosystem Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Apps Status */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { name: 'POS System', status: 'online', url: 'pos.nilelink.app' },
                                { name: 'Customer App', status: 'online', url: 'app.nilelink.app' },
                                { name: 'Delivery Portal', status: 'online', url: 'delivery.nilelink.app' },
                                { name: 'Supplier Portal', status: 'online', url: 'supplier.nilelink.app' },
                                { name: 'Admin Dashboard', status: 'online', url: 'admin.nilelink.app' }
                            ].map((app) => (
                                <div key={app.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">{app.name}</p>
                                            <p className="text-sm text-gray-500">{app.url}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Online
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">User approved</p>
                                    <p className="text-xs text-gray-500">Elite Restaurant Ltd. - 2 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New registration</p>
                                    <p className="text-xs text-gray-500">Fast Food Corner - Pending approval</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Payment processed</p>
                                    <p className="text-xs text-gray-500">$250.00 via blockchain - 5 minutes ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">System health check</p>
                                    <p className="text-xs text-gray-500">All services operational - 10 minutes ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>NileLink Ecosystem Control Panel • Version 1.0.0</p>
                    <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}