'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users,
    Shield,
    ArrowLeft,
    Plus,
    Trash2,
    Edit,
    Search,
    Mail,
    Phone,
    Building,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react'

interface User {
    id: string
    email: string
    phone?: string
    firstName: string
    lastName: string
    businessName?: string
    role: string
    status: 'approved' | 'pending_approval' | 'rejected' | 'suspended'
    createdAt: string
    subscription?: {
        plan: string
        status: string
    }
}

export default function UsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        // Check admin authentication
        const adminSession = localStorage.getItem('admin_session')
        if (!adminSession) {
            router.push('/login')
            return
        }

        loadUsers()
    }, [router])

    const loadUsers = () => {
        const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]')
        setUsers(allUsers)
        setIsLoading(false)
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.businessName && user.businessName.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesFilter = filterStatus === 'all' || user.status === filterStatus

        return matchesSearch && matchesFilter
    })

    const handleDeleteUser = (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const updatedUsers = users.filter(u => u.id !== userId)
            setUsers(updatedUsers)
            localStorage.setItem('allRegisteredUsers', JSON.stringify(updatedUsers))
            setSelectedUser(null)
        }
    }

    const handleSuspendUser = (userId: string) => {
        const updatedUsers = users.map(u =>
            u.id === userId ? { ...u, status: 'suspended' as const } : u
        )
        setUsers(updatedUsers)
        localStorage.setItem('allRegisteredUsers', JSON.stringify(updatedUsers))
        setSelectedUser(null)
    }

    const handleActivateUser = (userId: string) => {
        const updatedUsers = users.map(u =>
            u.id === userId ? { ...u, status: 'approved' as const } : u
        )
        setUsers(updatedUsers)
        localStorage.setItem('allRegisteredUsers', JSON.stringify(updatedUsers))
        setSelectedUser(null)
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending_approval: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-100 text-gray-800'
        }
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <button onClick={() => router.push('/dashboard')} className="mr-4">
                                <ArrowLeft className="h-6 w-6 text-gray-600" />
                            </button>
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-red-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                                    <p className="text-sm text-gray-500">Manage all system users</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending_approval">Pending</option>
                            <option value="suspended">Suspended</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {users.filter(u => u.status === 'approved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {users.filter(u => u.status === 'pending_approval').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <XCircle className="h-8 w-8 text-gray-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-gray-600">
                                    {users.filter(u => u.status === 'suspended').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                        <span className="text-red-600 font-bold">
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    {user.businessName && (
                                                        <div className="text-sm text-gray-500">{user.businessName}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            {user.phone && (
                                                <div className="text-sm text-gray-500">{user.phone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.role}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                                                {user.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Details Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">User Details</h2>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-gray-700">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700">Name</h3>
                                    <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                                </div>
                                {selectedUser.businessName && (
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Business</h3>
                                        <p>{selectedUser.businessName}</p>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-700">Email</h3>
                                    <p>{selectedUser.email}</p>
                                </div>
                                {selectedUser.phone && (
                                    <div>
                                        <h3 className="font-semibold text-gray-700">Phone</h3>
                                        <p>{selectedUser.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-700">Status</h3>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(selectedUser.status)}`}>
                                        {selectedUser.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-4">
                                {selectedUser.status === 'suspended' ? (
                                    <button
                                        onClick={() => handleActivateUser(selectedUser.id)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Activate User
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSuspendUser(selectedUser.id)}
                                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                    >
                                        Suspend User
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
